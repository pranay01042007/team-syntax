import logging
from sqlalchemy.orm import Session
from app.database.session import engine, Base, SessionLocal
from app.models.entities import User, VendorProfile, Product, Cart, CartItem, Order, OrderItem
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

def seed_database():
    """Idempotently seed the MarketHub database with required accounts and realistic catalog."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@markethub.com").first():
            logger.info("Database already seeded.")
            return

        print("Seeding MarketHub database...")

        # 1. Admin
        admin_user = User(
            name="Platform Administrator",
            email="admin@markethub.com",
            password_hash=get_password_hash("Admin@123"),
            role="ADMIN",
            is_active=True
        )
        db.add(admin_user)

        # 2. Vendors
        vendor1_user = User(
            name="Apex Tech Gear",
            email="techvendor@markethub.com",
            password_hash=get_password_hash("Vendor@123"),
            role="VENDOR",
            is_active=True
        )
        db.add(vendor1_user)

        vendor2_user = User(
            name="UrbanStyle Living",
            email="stylevendor@markethub.com",
            password_hash=get_password_hash("Vendor@123"),
            role="VENDOR",
            is_active=True
        )
        db.add(vendor2_user)

        # 3. Customers
        customer1 = User(
            name="John Doe",
            email="customer@markethub.com",
            password_hash=get_password_hash("Customer@123"),
            role="CUSTOMER",
            is_active=True
        )
        db.add(customer1)

        customer2 = User(
            name="P. Daniel",
            email="daniel@example.com",
            password_hash=get_password_hash("Customer@123"),
            role="CUSTOMER",
            is_active=True
        )
        db.add(customer2)

        customer3 = User(
            name="Sarah Connor",
            email="sarah@example.com",
            password_hash=get_password_hash("Customer@123"),
            role="CUSTOMER",
            is_active=True
        )
        db.add(customer3)

        db.commit()

        # Vendor Profiles
        vendor1_profile = VendorProfile(
            user_id=vendor1_user.id,
            store_name="Apex Tech Hub",
            description="Premium electronics, computer hardware, and modern accessories.",
            contact_info="support@apextech.com",
            status="ACTIVE"
        )
        db.add(vendor1_profile)

        vendor2_profile = VendorProfile(
            user_id=vendor2_user.id,
            store_name="UrbanStyle & Co",
            description="Contemporary fashion, home aesthetics, books, and lifestyle goods.",
            contact_info="hello@urbanstyle.com",
            status="ACTIVE"
        )
        db.add(vendor2_profile)

        # Carts for customers
        for cust in [customer1, customer2, customer3]:
            cart = Cart(customer_id=cust.id)
            db.add(cart)

        db.commit()

        # Seed Products (at least 10 products across 5 categories)
        products_data = [
            # Electronics (Vendor 1)
            {
                "vendor_id": vendor1_profile.id,
                "name": "Sony WH-1000XM5 Wireless Headphones",
                "description": "Industry-leading noise canceling headphones with dual processors and 8 microphones for unparalleled sound quality.",
                "category": "Electronics",
                "price": 349.99,
                "stock": 45,
                "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"
            },
            {
                "vendor_id": vendor1_profile.id,
                "name": "Logitech MX Master 3S Mouse",
                "description": "Ergonomic wireless performance mouse with ultra-fast MagSpeed scrolling and 8K DPI sensor.",
                "category": "Electronics",
                "price": 99.99,
                "stock": 80,
                "image_url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80"
            },
            {
                "vendor_id": vendor1_profile.id,
                "name": "Mechanical Gaming Keyboard RGB",
                "description": "Custom mechanical keyboard with hot-swappable switches, PBT double-shot keycaps, and per-key RGB backlight.",
                "category": "Electronics",
                "price": 129.50,
                "stock": 30,
                "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80"
            },
            {
                "vendor_id": vendor1_profile.id,
                "name": "Ultra HD 4K Webcam 60FPS",
                "description": "Studio-quality streaming webcam with HDR, AI autoframing, and stereo noise-reduction microphones.",
                "category": "Electronics",
                "price": 159.00,
                "stock": 25,
                "image_url": "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&q=80"
            },
            # Books (Vendor 2)
            {
                "vendor_id": vendor2_profile.id,
                "name": "Designing Data-Intensive Applications",
                "description": "The definitive guide to the architecture of large-scale distributed systems and data storage by Martin Kleppmann.",
                "category": "Books",
                "price": 44.95,
                "stock": 50,
                "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80"
            },
            {
                "vendor_id": vendor2_profile.id,
                "name": "Clean Architecture by Robert C. Martin",
                "description": "A craftsman's guide to software structure and design. Essential reading for all secure engineers.",
                "category": "Books",
                "price": 37.50,
                "stock": 60,
                "image_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80"
            },
            # Clothing (Vendor 2)
            {
                "vendor_id": vendor2_profile.id,
                "name": "Organic Heavyweight Cotton Hoodie",
                "description": "Premium 450 GSM organic French terry hoodie. Structured fit, pre-shrunk, with hidden utility pocket.",
                "category": "Clothing",
                "price": 78.00,
                "stock": 40,
                "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80"
            },
            {
                "vendor_id": vendor2_profile.id,
                "name": "Minimalist Waterproof Windbreaker",
                "description": "Ultralight breathable shell jacket featuring ripstop nylon, taped seams, and packable design.",
                "category": "Clothing",
                "price": 115.00,
                "stock": 35,
                "image_url": "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&q=80"
            },
            # Home & Kitchen (Vendor 2)
            {
                "vendor_id": vendor2_profile.id,
                "name": "Precision Gooseneck Electric Kettle",
                "description": "Matte black stainless steel pour-over kettle with PID temperature control and 60-minute hold mode.",
                "category": "Home & Kitchen",
                "price": 89.99,
                "stock": 20,
                "image_url": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&q=80"
            },
            {
                "vendor_id": vendor2_profile.id,
                "name": "Ceramic Pour-Over Coffee Dripper Set",
                "description": "Handcrafted minimalist ceramic dripper with borosilicate server and brass measuring scoop.",
                "category": "Home & Kitchen",
                "price": 49.00,
                "stock": 45,
                "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"
            },
            # Accessories (Vendor 1)
            {
                "vendor_id": vendor1_profile.id,
                "name": "Full-Grain Leather Laptop Sleeve 14-inch",
                "description": "Crafted from vegetable-tanned genuine leather with magnetic closure and soft microfiber inner lining.",
                "category": "Accessories",
                "price": 65.00,
                "stock": 55,
                "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80"
            },
            {
                "vendor_id": vendor1_profile.id,
                "name": "Anodized Aluminum MagSafe Phone Stand",
                "description": "Weighted desktop phone dock with 360-degree rotation and cable management channel.",
                "category": "Accessories",
                "price": 32.00,
                "stock": 90,
                "image_url": "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&q=80"
            }
        ]

        for p_data in products_data:
            prod = Product(
                vendor_id=p_data["vendor_id"],
                name=p_data["name"],
                description=p_data["description"],
                category=p_data["category"],
                price=p_data["price"],
                stock=p_data["stock"],
                image_url=p_data["image_url"],
                is_active=True
            )
            db.add(prod)

        db.commit()
        print("Database seeded successfully with 1 admin, 2 vendors, 3 customers, and 12 products.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
