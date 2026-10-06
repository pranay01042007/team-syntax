from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.entities import User, VendorProfile, Product, Order, OrderItem
from app.schemas.schemas import (
    AdminStatsResponse, UserResponse, VendorProfileResponse, ProductResponse,
    OrderResponse, UserStatusUpdate, OrderStatusUpdate
)
from app.api.deps import require_admin
from app.api.orders import format_order_response

router = APIRouter()

@router.get("/dashboard", response_model=AdminStatsResponse)
def get_admin_dashboard(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Platform overview analytics for system administrators."""
    total_users = db.query(User).count()
    total_customers = db.query(User).filter(User.role == "CUSTOMER").count()
    total_vendors = db.query(User).filter(User.role == "VENDOR").count()
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    
    total_revenue_val = db.query(func.sum(Order.total_amount)).scalar()
    total_revenue = round(float(total_revenue_val or 0.0), 2)

    return AdminStatsResponse(
        total_users=total_users,
        total_customers=total_customers,
        total_vendors=total_vendors,
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=total_revenue
    )


@router.get("/users", response_model=List[UserResponse])
def get_admin_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieve all users across the marketplace."""
    users = db.query(User).order_by(User.id.asc()).all()
    return [UserResponse.model_validate(u) for u in users]


@router.patch("/users/{user_id}/status", response_model=UserResponse)
def toggle_user_status(
    user_id: int,
    status_in: UserStatusUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Activate or deactivate a user account."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot deactivate their own account"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if status_in.is_active is not None:
        user.is_active = status_in.is_active

    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


@router.get("/vendors", response_model=List[VendorProfileResponse])
def get_admin_vendors(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieve all registered vendor store profiles."""
    vendors = db.query(VendorProfile).all()
    results = []
    for v in vendors:
        item = VendorProfileResponse.model_validate(v)
        item.user = UserResponse.model_validate(v.user) if v.user else None
        results.append(item)
    return results


@router.patch("/vendors/{vendor_id}/status")
def update_vendor_status(
    vendor_id: int,
    status_name: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Activate or suspend a vendor store."""
    vendor = db.query(VendorProfile).filter(VendorProfile.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    vendor.status = status_name.upper()
    db.commit()
    return {"message": f"Vendor status updated to {vendor.status}", "vendor_id": vendor.id}


@router.get("/products", response_model=List[ProductResponse])
def get_admin_products(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieve all products in marketplace (both active and inactive)."""
    products = db.query(Product).order_by(Product.id.asc()).all()
    results = []
    for p in products:
        item = ProductResponse.model_validate(p)
        if p.vendor:
            item.store_name = p.vendor.store_name
        results.append(item)
    return results


@router.get("/orders", response_model=List[OrderResponse])
def get_admin_orders(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieve all marketplace orders."""
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return [format_order_response(o) for o in orders]
