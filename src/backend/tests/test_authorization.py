def test_customer_cannot_access_vendor_routes(client, test_users, auth_headers):
    headers = auth_headers(test_users["customer1"])
    response = client.get("/api/vendor/dashboard", headers=headers)
    assert response.status_code == 403

def test_customer_cannot_access_admin_routes(client, test_users, auth_headers):
    headers = auth_headers(test_users["customer1"])
    response = client.get("/api/admin/dashboard", headers=headers)
    assert response.status_code == 403

def test_vendor_cannot_access_admin_routes(client, test_users, auth_headers):
    headers = auth_headers(test_users["vendor1"])
    response = client.get("/api/admin/dashboard", headers=headers)
    assert response.status_code == 403

def test_customer_cannot_modify_products(client, test_users, auth_headers):
    headers = auth_headers(test_users["customer1"])
    payload = {"name": "Hacked Product", "price": 10.0}
    response = client.put(f"/api/products/{test_users['product1'].id}", json=payload, headers=headers)
    assert response.status_code == 403

def test_vendor_cannot_modify_another_vendors_product(client, test_users, auth_headers):
    # Vendor 2 tries to modify Vendor 1's product
    headers = auth_headers(test_users["vendor2"])
    payload = {"price": 1.0}
    response = client.put(f"/api/products/{test_users['product1'].id}", json=payload, headers=headers)
    assert response.status_code == 403
    assert "Forbidden" in response.json()["detail"]
