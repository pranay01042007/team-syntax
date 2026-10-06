from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Product, VendorProfile, User
from app.schemas.schemas import ProductCreate, ProductUpdate, ProductResponse
from app.api.deps import get_current_user, require_role

router = APIRouter()

@router.get("", response_model=List[ProductResponse])
def get_products(
    search: Optional[str] = Query(None, description="Search term for name or description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    vendor_id: Optional[int] = Query(None, description="Filter by vendor id"),
    sort_by: Optional[str] = Query("newest", description="Sort: newest, price_asc, price_desc"),
    db: Session = Depends(get_db)
):
    """Retrieve public active products with flexible search, category filtering, and sorting."""
    query = db.query(Product).filter(Product.is_active == True)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (Product.name.ilike(search_pattern)) | 
            (Product.description.ilike(search_pattern))
        )
    
    if category and category.strip():
        query = query.filter(Product.category.ilike(category.strip()))
    
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    if vendor_id is not None:
        query = query.filter(Product.vendor_id == vendor_id)

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    else:  # newest
        query = query.order_by(Product.created_at.desc())

    products = query.all()

    # Format response with store name
    results = []
    for p in products:
        item = ProductResponse.model_validate(p)
        if p.vendor:
            item.store_name = p.vendor.store_name
        results.append(item)
    return results


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Retrieve single product by ID."""
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or inactive"
        )
    res = ProductResponse.model_validate(product)
    if product.vendor:
        res.store_name = product.vendor.store_name
    return res


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    current_user: User = Depends(require_role(["VENDOR"])),
    db: Session = Depends(get_db)
):
    """Create a new product owned by the authenticated vendor."""
    vendor = current_user.vendor_profile
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vendor profile not initialized for this account"
        )
    
    if vendor.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vendor account is not active"
        )

    product = Product(
        vendor_id=vendor.id,
        name=product_in.name,
        description=product_in.description,
        category=product_in.category,
        price=product_in.price,
        stock=product_in.stock,
        image_url=product_in.image_url,
        is_active=True
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    res = ProductResponse.model_validate(product)
    res.store_name = vendor.store_name
    return res


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    current_user: User = Depends(require_role(["VENDOR", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """Update a product. Vendors may only update their own products; Admin may update any."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Ownership enforcement for vendors (IDOR protection)
    if current_user.role == "VENDOR":
        if not current_user.vendor_profile or product.vendor_id != current_user.vendor_profile.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You cannot modify products belonging to another vendor"
            )

    update_data = product_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(product, field, val)

    db.commit()
    db.refresh(product)

    res = ProductResponse.model_validate(product)
    if product.vendor:
        res.store_name = product.vendor.store_name
    return res


@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(
    product_id: int,
    current_user: User = Depends(require_role(["VENDOR", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """Delete a product. Vendors may only delete their own products; Admin may delete any."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    if current_user.role == "VENDOR":
        if not current_user.vendor_profile or product.vendor_id != current_user.vendor_profile.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You cannot delete products belonging to another vendor"
            )

    # Soft delete to preserve historical order items integrity
    product.is_active = False
    db.commit()
    return {"message": f"Product '{product.name}' deleted successfully", "id": product_id}
