from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.entities import User, VendorProfile, Cart
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register new customer or vendor with bcrypt hashing and immediate JWT issuance."""
    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists"
        )
    
    # Create user
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email.lower(),
        password_hash=hashed_pwd,
        role=user_in.role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # If vendor, create initial vendor profile
    if new_user.role == "VENDOR":
        store_name = user_in.store_name or f"{new_user.name}'s Shop"
        vendor_profile = VendorProfile(
            user_id=new_user.id,
            store_name=store_name,
            description=f"Official store of {new_user.name}",
            contact_info=new_user.email,
            status="ACTIVE"
        )
        db.add(vendor_profile)
        db.commit()
    elif new_user.role == "CUSTOMER":
        # Create empty cart for customer
        cart = Cart(customer_id=new_user.id)
        db.add(cart)
        db.commit()

    token = create_access_token(subject=new_user.id, role=new_user.role)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user with email and password."""
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Please contact an administrator."
        )
    
    token = create_access_token(subject=user.id, role=user.role)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """Acknowledge logout for the authenticated session."""
    return {"message": "Successfully logged out", "user_id": current_user.id}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return profile details for current authenticated user."""
    profile_data = {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }
    if current_user.role == "VENDOR" and current_user.vendor_profile:
        profile_data["vendor_profile"] = {
            "id": current_user.vendor_profile.id,
            "store_name": current_user.vendor_profile.store_name,
            "description": current_user.vendor_profile.description,
            "contact_info": current_user.vendor_profile.contact_info,
            "status": current_user.vendor_profile.status
        }
    return profile_data
