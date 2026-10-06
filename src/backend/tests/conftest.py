import pytest
import sys
import os

# Add src/backend to sys.path so app imports work seamlessly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from starlette.testclient import TestClient

from app.database.session import Base, get_db
from app.main import app
from app.core.security import get_password_hash, create_access_token
from app.models.entities import User, VendorProfile, Product, Cart, CartItem, Order, OrderItem

# In-memory SQLite database for isolated test runs
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(setup_test_db):
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_users(db_session):
    """Seed test users: admin, vendor1, vendor2, customer1, customer2."""
    admin = User(
        name="Admin Test",
        email="test_admin@markethub.com",
        password_hash=get_password_hash("AdminPass123"),
        role="ADMIN",
        is_active=True
    )
    v1_user = User(
        name="Vendor 1 Test",
        email="test_v1@markethub.com",
        password_hash=get_password_hash("VendorPass123"),
        role="VENDOR",
        is_active=True
    )
    v2_user = User(
        name="Vendor 2 Test",
        email="test_v2@markethub.com",
        password_hash=get_password_hash("VendorPass123"),
        role="VENDOR",
        is_active=True
    )
    c1 = User(
        name="Customer 1 Test",
        email="test_c1@markethub.com",
        password_hash=get_password_hash("CustomerPass123"),
        role="CUSTOMER",
        is_active=True
    )
    c2 = User(
        name="Customer 2 Test",
        email="test_c2@markethub.com",
        password_hash=get_password_hash("CustomerPass123"),
        role="CUSTOMER",
        is_active=True
    )
    db_session.add_all([admin, v1_user, v2_user, c1, c2])
    db_session.commit()

    v1_profile = VendorProfile(
        user_id=v1_user.id,
        store_name="V1 Electronics",
        description="V1 shop",
        contact_info="v1@test.com",
        status="ACTIVE"
    )
    v2_profile = VendorProfile(
        user_id=v2_user.id,
        store_name="V2 Fashion",
        description="V2 shop",
        contact_info="v2@test.com",
        status="ACTIVE"
    )
    cart1 = Cart(customer_id=c1.id)
    cart2 = Cart(customer_id=c2.id)
    db_session.add_all([v1_profile, v2_profile, cart1, cart2])
    db_session.commit()

    p1 = Product(
        vendor_id=v1_profile.id,
        name="Test Laptop",
        description="High spec gaming laptop with fast SSD",
        category="Electronics",
        price=1200.0,
        stock=10,
        image_url="https://example.com/laptop.jpg",
        is_active=True
    )
    p2 = Product(
        vendor_id=v2_profile.id,
        name="Test Denim Jacket",
        description="Vintage wash denim jacket jacket",
        category="Clothing",
        price=80.0,
        stock=20,
        image_url="https://example.com/jacket.jpg",
        is_active=True
    )
    db_session.add_all([p1, p2])
    db_session.commit()

    return {
        "admin": admin,
        "vendor1": v1_user,
        "vendor2": v2_user,
        "vendor1_profile": v1_profile,
        "vendor2_profile": v2_profile,
        "customer1": c1,
        "customer2": c2,
        "product1": p1,
        "product2": p2
    }

@pytest.fixture
def auth_headers(test_users):
    """Return JWT Bearer auth headers for each role."""
    def _get_headers(user):
        token = create_access_token(subject=user.id, role=user.role)
        return {"Authorization": f"Bearer {token}"}
    return _get_headers
