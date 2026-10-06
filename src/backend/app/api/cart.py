from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Cart, CartItem, Product, User
from app.schemas.schemas import CartItemCreate, CartItemUpdate, CartResponse, CartItemResponse
from app.api.deps import require_role

router = APIRouter()

def get_or_create_customer_cart(customer_id: int, db: Session) -> Cart:
    """Retrieve existing cart or initialize a fresh cart for customer."""
    cart = db.query(Cart).filter(Cart.customer_id == customer_id).first()
    if not cart:
        cart = Cart(customer_id=customer_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

def build_cart_response(cart: Cart) -> CartResponse:
    """Helper to compute authoritative subtotals and totals from database."""
    items_response = []
    total = 0.0
    item_count = 0

    for item in cart.items:
        # Use active product price
        product = item.product
        if product and product.is_active:
            subtotal = round(item.quantity * product.price, 2)
            total += subtotal
            item_count += item.quantity
            items_response.append(CartItemResponse(
                id=item.id,
                product_id=product.id,
                product_name=product.name,
                product_price=product.price,
                product_stock=product.stock,
                product_image=product.image_url,
                quantity=item.quantity,
                subtotal=subtotal
            ))
    
    return CartResponse(
        id=cart.id,
        customer_id=cart.customer_id,
        items=items_response,
        total_amount=round(total, 2),
        item_count=item_count
    )


@router.get("", response_model=CartResponse)
def get_cart(
    current_user: User = Depends(require_role(["CUSTOMER"])),
    db: Session = Depends(get_db)
):
    """Retrieve customer cart with live pricing and stock validation."""
    cart = get_or_create_customer_cart(current_user.id, db)
    return build_cart_response(cart)


@router.post("/items", response_model=CartResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item_in: CartItemCreate,
    current_user: User = Depends(require_role(["CUSTOMER"])),
    db: Session = Depends(get_db)
):
    """Add product to cart with strict stock and active verification."""
    product = db.query(Product).filter(Product.id == item_in.product_id).first()
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or unavailable"
        )
    
    if item_in.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Quantity must be greater than zero"
        )

    cart = get_or_create_customer_cart(current_user.id, db)

    # Check if product is already in cart
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == product.id
    ).first()

    total_requested_quantity = item_in.quantity + (existing_item.quantity if existing_item else 0)

    if total_requested_quantity > product.stock:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Insufficient stock available. Requested: {total_requested_quantity}, Available: {product.stock}"
        )

    if existing_item:
        existing_item.quantity = total_requested_quantity
        existing_item.price_at_addition = product.price
    else:
        new_item = CartItem(
            cart_id=cart.id,
            product_id=product.id,
            quantity=item_in.quantity,
            price_at_addition=product.price
        )
        db.add(new_item)

    db.commit()
    db.refresh(cart)
    return build_cart_response(cart)


@router.put("/items/{item_id}", response_model=CartResponse)
def update_cart_item(
    item_id: int,
    item_update: CartItemUpdate,
    current_user: User = Depends(require_role(["CUSTOMER"])),
    db: Session = Depends(get_db)
):
    """Update cart item quantity with stock validation and IDOR protection."""
    cart = get_or_create_customer_cart(current_user.id, db)
    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found in your cart"
        )

    product = cart_item.product
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is no longer available"
        )

    if item_update.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Quantity must be at least 1"
        )

    if item_update.quantity > product.stock:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Requested quantity exceeds available stock ({product.stock})"
        )

    cart_item.quantity = item_update.quantity
    cart_item.price_at_addition = product.price
    db.commit()
    db.refresh(cart)
    return build_cart_response(cart)


@router.delete("/items/{item_id}", response_model=CartResponse)
def remove_cart_item(
    item_id: int,
    current_user: User = Depends(require_role(["CUSTOMER"])),
    db: Session = Depends(get_db)
):
    """Remove item from cart."""
    cart = get_or_create_customer_cart(current_user.id, db)
    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found in your cart"
        )

    db.delete(cart_item)
    db.commit()
    db.refresh(cart)
    return build_cart_response(cart)


@router.delete("", status_code=status.HTTP_200_OK)
def clear_cart(
    current_user: User = Depends(require_role(["CUSTOMER"])),
    db: Session = Depends(get_db)
):
    """Clear all items in customer cart."""
    cart = get_or_create_customer_cart(current_user.id, db)
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    return {"message": "Cart cleared successfully"}
