from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Order, OrderItem, Cart, CartItem, Product, User, VendorProfile
from app.schemas.schemas import OrderCreate, OrderResponse, OrderItemResponse, OrderStatusUpdate
from app.api.deps import get_current_user, require_role

router = APIRouter()

def format_order_response(order: Order) -> OrderResponse:
    """Helper to convert Order ORM entity to response schema."""
    item_responses = []
    for oi in order.items:
        store_name = oi.vendor.store_name if oi.vendor else None
        item_responses.append(OrderItemResponse(
            id=oi.id,
            product_id=oi.product_id,
            product_name=oi.product.name if oi.product else "Unavailable Product",
            vendor_id=oi.vendor_id,
            store_name=store_name,
            quantity=oi.quantity,
            unit_price=oi.unit_price,
            subtotal=oi.subtotal
        ))
    
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.name if order.customer else None,
        total_amount=order.total_amount,
        shipping_name=order.shipping_name,
        shipping_address=order.shipping_address,
        shipping_city=order.shipping_city,
        shipping_state=order.shipping_state,
        shipping_pincode=order.shipping_pincode,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        order_status=order.order_status,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=item_responses
    )


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def checkout_create_order(
    order_in: OrderCreate,
    current_user: User = Depends(require_role(["CUSTOMER"])),
    db: Session = Depends(get_db)
):
    """
    Simulated Checkout & Order Placement:
    1. Validate customer cart.
    2. Validate product stock and status.
    3. Calculate authoritative total on backend.
    4. Create order and order items.
    5. Decrement stock safely.
    6. Clear customer cart.
    """
    cart = db.query(Cart).filter(Cart.customer_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your cart is empty. Add products to cart before checkout."
        )

    # Validate stock and calculate total
    order_items_to_create = []
    calculated_total = 0.0

    for item in cart.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{item.product.name if item.product else 'Unknown'}' is no longer active or available."
            )
        
        if item.quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Insufficient stock for '{product.name}'. Requested: {item.quantity}, Available: {product.stock}"
            )

        unit_price = product.price
        subtotal = round(unit_price * item.quantity, 2)
        calculated_total += subtotal

        order_items_to_create.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": unit_price,
            "subtotal": subtotal,
            "vendor_id": product.vendor_id
        })

    # Create Order
    new_order = Order(
        customer_id=current_user.id,
        total_amount=round(calculated_total, 2),
        shipping_name=order_in.shipping_name,
        shipping_address=order_in.shipping_address,
        shipping_city=order_in.shipping_city,
        shipping_state=order_in.shipping_state,
        shipping_pincode=order_in.shipping_pincode,
        payment_method=order_in.payment_method,
        payment_status="COMPLETED (SIMULATED)",
        order_status="CONFIRMED"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Create OrderItems and decrement stock
    for oi_data in order_items_to_create:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=oi_data["product"].id,
            vendor_id=oi_data["vendor_id"],
            quantity=oi_data["quantity"],
            unit_price=oi_data["unit_price"],
            subtotal=oi_data["subtotal"]
        )
        db.add(order_item)
        # Reduce product stock
        oi_data["product"].stock -= oi_data["quantity"]

    # Clear cart items
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    db.refresh(new_order)

    return format_order_response(new_order)


@router.get("", response_model=List[OrderResponse])
def get_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get orders based on role:
    - CUSTOMER: gets their own orders
    - VENDOR: gets orders containing their products
    - ADMIN: gets all marketplace orders
    """
    if current_user.role == "CUSTOMER":
        orders = db.query(Order).filter(Order.customer_id == current_user.id).order_by(Order.created_at.desc()).all()
        return [format_order_response(o) for o in orders]

    elif current_user.role == "VENDOR":
        if not current_user.vendor_profile:
            return []
        vendor_id = current_user.vendor_profile.id
        # Find orders that have items for this vendor
        orders = (
            db.query(Order)
            .join(OrderItem, OrderItem.order_id == Order.id)
            .filter(OrderItem.vendor_id == vendor_id)
            .distinct()
            .order_by(Order.created_at.desc())
            .all()
        )
        # For vendor view, filter items to only vendor's items or show all
        return [format_order_response(o) for o in orders]

    elif current_user.role == "ADMIN":
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
        return [format_order_response(o) for o in orders]

    return []


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get order details with strict authorization:
    - Customer can ONLY see their own order.
    - Vendor can only see orders containing their products.
    - Admin can see any order.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Authorization verification
    if current_user.role == "CUSTOMER":
        if order.customer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You can only view your own orders"
            )
    elif current_user.role == "VENDOR":
        vendor_id = current_user.vendor_profile.id if current_user.vendor_profile else -1
        vendor_order_item = db.query(OrderItem).filter(
            OrderItem.order_id == order.id,
            OrderItem.vendor_id == vendor_id
        ).first()
        if not vendor_order_item:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Order does not contain products from your store"
            )

    return format_order_response(order)


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    current_user: User = Depends(require_role(["VENDOR", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    Update order status:
    - Vendor can update status for orders containing their items.
    - Admin can update any order.
    - Customers cannot update status.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    if current_user.role == "VENDOR":
        vendor_id = current_user.vendor_profile.id if current_user.vendor_profile else -1
        vendor_item = db.query(OrderItem).filter(
            OrderItem.order_id == order.id,
            OrderItem.vendor_id == vendor_id
        ).first()
        if not vendor_item:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You cannot modify orders that do not include your items"
            )

    order.order_status = status_update.order_status
    db.commit()
    db.refresh(order)
    return format_order_response(order)
