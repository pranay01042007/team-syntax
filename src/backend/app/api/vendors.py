from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.entities import VendorProfile, Product, Order, OrderItem, User
from app.schemas.schemas import (
    VendorStatsResponse, ProductResponse, VendorProfileResponse, VendorProfileUpdate
)
from app.api.deps import require_role
from app.api.orders import format_order_response

router = APIRouter()

@router.get("/dashboard", response_model=VendorStatsResponse)
def get_vendor_dashboard(
    current_user: User = Depends(require_role(["VENDOR"])),
    db: Session = Depends(get_db)
):
    """Retrieve operational dashboard statistics for the authenticated vendor."""
    vendor = current_user.vendor_profile
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found"
        )

    total_products = db.query(Product).filter(Product.vendor_id == vendor.id).count()
    active_products = db.query(Product).filter(Product.vendor_id == vendor.id, Product.is_active == True).count()

    # Get vendor's order items
    vendor_items = db.query(OrderItem).filter(OrderItem.vendor_id == vendor.id).all()
    total_sales = round(sum(item.subtotal for item in vendor_items), 2)

    # Get distinct orders and their statuses
    vendor_orders = (
        db.query(Order)
        .join(OrderItem, OrderItem.order_id == Order.id)
        .filter(OrderItem.vendor_id == vendor.id)
        .all()
    )

    pending_orders = sum(1 for o in vendor_orders if o.order_status in ["PENDING", "CONFIRMED"])
    processing_orders = sum(1 for o in vendor_orders if o.order_status == "PROCESSING")
    delivered_orders = sum(1 for o in vendor_orders if o.order_status == "DELIVERED")

    return VendorStatsResponse(
        total_products=total_products,
        active_products=active_products,
        pending_orders=pending_orders,
        processing_orders=processing_orders,
        delivered_orders=delivered_orders,
        total_sales=total_sales
    )


@router.get("/products", response_model=List[ProductResponse])
def get_vendor_products(
    current_user: User = Depends(require_role(["VENDOR"])),
    db: Session = Depends(get_db)
):
    """Get all products belonging to the current vendor."""
    vendor = current_user.vendor_profile
    if not vendor:
        return []

    products = db.query(Product).filter(Product.vendor_id == vendor.id).order_by(Product.created_at.desc()).all()
    results = []
    for p in products:
        item = ProductResponse.model_validate(p)
        item.store_name = vendor.store_name
        results.append(item)
    return results


@router.get("/orders")
def get_vendor_orders(
    current_user: User = Depends(require_role(["VENDOR"])),
    db: Session = Depends(get_db)
):
    """Get all customer orders containing products from this vendor."""
    vendor = current_user.vendor_profile
    if not vendor:
        return []

    orders = (
        db.query(Order)
        .join(OrderItem, OrderItem.order_id == Order.id)
        .filter(OrderItem.vendor_id == vendor.id)
        .distinct()
        .order_by(Order.created_at.desc())
        .all()
    )
    return [format_order_response(o) for o in orders]


@router.get("/profile", response_model=VendorProfileResponse)
def get_vendor_profile(
    current_user: User = Depends(require_role(["VENDOR"])),
    db: Session = Depends(get_db)
):
    """Retrieve vendor's store profile."""
    vendor = current_user.vendor_profile
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    return VendorProfileResponse.model_validate(vendor)


@router.put("/profile", response_model=VendorProfileResponse)
def update_vendor_profile(
    profile_update: VendorProfileUpdate,
    current_user: User = Depends(require_role(["VENDOR"])),
    db: Session = Depends(get_db)
):
    """Update vendor's store details."""
    vendor = current_user.vendor_profile
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")

    if profile_update.store_name is not None:
        vendor.store_name = profile_update.store_name
    if profile_update.description is not None:
        vendor.description = profile_update.description
    if profile_update.contact_info is not None:
        vendor.contact_info = profile_update.contact_info

    db.commit()
    db.refresh(vendor)
    return VendorProfileResponse.model_validate(vendor)
