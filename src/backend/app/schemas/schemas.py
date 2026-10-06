from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, field_validator

# -------------------------------------------------------------
# User & Auth Schemas
# -------------------------------------------------------------
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    role: str = Field("CUSTOMER", description="Role: CUSTOMER or VENDOR. ADMIN registration is disallowed.")
    store_name: Optional[str] = Field(None, description="Required if role is VENDOR")

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        role_upper = v.upper()
        if role_upper not in ["CUSTOMER", "VENDOR"]:
            raise ValueError("Role must be either CUSTOMER or VENDOR")
        return role_upper


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    is_active: Optional[bool] = None


class UserStatusUpdate(BaseModel):
    is_active: bool


# -------------------------------------------------------------
# Vendor Schemas
# -------------------------------------------------------------
class VendorProfileCreate(BaseModel):
    store_name: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = Field(None, max_length=1000)
    contact_info: Optional[str] = Field(None, max_length=255)


class VendorProfileUpdate(BaseModel):
    store_name: Optional[str] = Field(None, min_length=2, max_length=150)
    description: Optional[str] = None
    contact_info: Optional[str] = None
    status: Optional[str] = None


class VendorProfileResponse(BaseModel):
    id: int
    user_id: int
    store_name: str
    description: Optional[str]
    contact_info: Optional[str]
    status: str
    created_at: datetime
    user: Optional[UserResponse] = None

    model_config = {"from_attributes": True}


# -------------------------------------------------------------
# Product Schemas
# -------------------------------------------------------------
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: str = Field(..., min_length=5)
    category: str = Field(..., min_length=2, max_length=100)
    price: float = Field(..., ge=0.01, description="Price must be greater than zero")
    stock: int = Field(..., ge=0, description="Stock cannot be negative")
    image_url: str = Field(..., min_length=5, max_length=500)


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = Field(None, min_length=5)
    category: Optional[str] = Field(None, min_length=2, max_length=100)
    price: Optional[float] = Field(None, ge=0.01)
    stock: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = Field(None, min_length=5, max_length=500)
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
    vendor_id: int
    store_name: Optional[str] = None
    name: str
    description: str
    category: str
    price: float
    stock: int
    image_url: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# -------------------------------------------------------------
# Cart Schemas
# -------------------------------------------------------------
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(1, ge=1, description="Quantity must be at least 1")


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1, description="Quantity must be at least 1")


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_price: float
    product_stock: int
    product_image: str
    quantity: int
    subtotal: float

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    id: int
    customer_id: int
    items: List[CartItemResponse]
    total_amount: float
    item_count: int


# -------------------------------------------------------------
# Order Schemas
# -------------------------------------------------------------
class OrderCreate(BaseModel):
    shipping_name: str = Field(..., min_length=2, max_length=150)
    shipping_address: str = Field(..., min_length=5, max_length=255)
    shipping_city: str = Field(..., min_length=2, max_length=100)
    shipping_state: str = Field(..., min_length=2, max_length=100)
    shipping_pincode: str = Field(..., min_length=3, max_length=20)
    payment_method: str = Field(..., description="Cash on Delivery, Simulated Card Payment, or Simulated UPI")

    @field_validator("payment_method")
    @classmethod
    def validate_payment_method(cls, v: str) -> str:
        allowed = ["Cash on Delivery", "Simulated Card Payment", "Simulated UPI"]
        if v not in allowed:
            raise ValueError(f"Payment method must be one of {allowed}")
        return v


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    vendor_id: int
    store_name: Optional[str] = None
    quantity: int
    unit_price: float
    subtotal: float

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    total_amount: float
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_pincode: str
    payment_method: str
    payment_status: str
    order_status: str
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse]

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    order_status: str

    @field_validator("order_status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
        upper = v.upper()
        if upper not in allowed:
            raise ValueError(f"Order status must be one of {allowed}")
        return upper


# -------------------------------------------------------------
# Dashboard & Admin Schemas
# -------------------------------------------------------------
class AdminStatsResponse(BaseModel):
    total_users: int
    total_customers: int
    total_vendors: int
    total_products: int
    total_orders: int
    total_revenue: float


class VendorStatsResponse(BaseModel):
    total_products: int
    active_products: int
    pending_orders: int
    processing_orders: int
    delivered_orders: int
    total_sales: float
