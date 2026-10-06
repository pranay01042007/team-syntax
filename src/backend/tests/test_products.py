def test_create_product_by_vendor(client, test_users, auth_headers):
    headers = auth_headers(test_users["vendor1"])
    payload = {
        "name": "Mechanical Keyboard",
        "description": "Tactile clicky switches",
        "category": "Electronics",
        "price": 89.99,
        "stock": 15,
        "image_url": "https://example.com/keyboard.jpg"
    }
    response = client.post("/api/products", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Mechanical Keyboard"
    assert data["price"] == 89.99
    assert data["store_name"] == "V1 Electronics"

def test_invalid_price_rejected(client, test_users, auth_headers):
    headers = auth_headers(test_users["vendor1"])
    payload = {
        "name": "Free Product",
        "description": "Invalid zero price",
        "category": "Electronics",
        "price": -10.0,
        "stock": 15,
        "image_url": "https://example.com/keyboard.jpg"
    }
    response = client.post("/api/products", json=payload, headers=headers)
    assert response.status_code == 422

def test_invalid_stock_rejected(client, test_users, auth_headers):
    headers = auth_headers(test_users["vendor1"])
    payload = {
        "name": "Negative Stock Product",
        "description": "Invalid negative stock",
        "category": "Electronics",
        "price": 50.0,
        "stock": -5,
        "image_url": "https://example.com/keyboard.jpg"
    }
    response = client.post("/api/products", json=payload, headers=headers)
    assert response.status_code == 422

def test_search_and_filter_products(client, test_users):
    # Search by keyword
    response = client.get("/api/products?search=Laptop")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    assert any("Laptop" in p["name"] for p in items)

    # Filter by category
    response = client.get("/api/products?category=Clothing")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    assert all(p["category"] == "Clothing" for p in items)

    # Filter by price range
    response = client.get("/api/products?min_price=100&max_price=1500")
    assert response.status_code == 200
    items = response.json()
    assert all(100 <= p["price"] <= 1500 for p in items)

def test_update_and_delete_product(client, test_users, auth_headers):
    headers = auth_headers(test_users["vendor1"])
    p1_id = test_users["product1"].id

    # Update
    update_res = client.put(f"/api/products/{p1_id}", json={"price": 1150.0}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["price"] == 1150.0

    # Soft Delete
    del_res = client.delete(f"/api/products/{p1_id}", headers=headers)
    assert del_res.status_code == 200

    # Verify not returned in active public listing
    get_res = client.get(f"/api/products/{p1_id}")
    assert get_res.status_code == 404
