def test_checkout_and_order_flow(client, test_users, auth_headers):
    c1_headers = auth_headers(test_users["customer1"])
    c2_headers = auth_headers(test_users["customer2"])
    v1_headers = auth_headers(test_users["vendor1"])
    p1 = test_users["product1"]
    initial_stock = p1.stock

    # Add item to cart
    client.post("/api/cart/items", json={"product_id": p1.id, "quantity": 2}, headers=c1_headers)

    # Checkout
    order_payload = {
        "shipping_name": "John Doe",
        "shipping_address": "123 Secure Way",
        "shipping_city": "Hyderabad",
        "shipping_state": "Telangana",
        "shipping_pincode": "500088",
        "payment_method": "Simulated UPI"
    }
    checkout_res = client.post("/api/orders", json=order_payload, headers=c1_headers)
    assert checkout_res.status_code == 201
    order_data = checkout_res.json()
    order_id = order_data["id"]

    assert order_data["total_amount"] == round(p1.price * 2, 2)
    assert order_data["order_status"] == "CONFIRMED"
    assert len(order_data["items"]) == 1

    # Verify cart is now empty
    cart_res = client.get("/api/cart", headers=c1_headers)
    assert len(cart_res.json()["items"]) == 0

    # Verify stock was decremented
    prod_res = client.get(f"/api/products/{p1.id}")
    assert prod_res.json()["stock"] == initial_stock - 2

    # Verify customer 1 can view own order
    view_res = client.get(f"/api/orders/{order_id}", headers=c1_headers)
    assert view_res.status_code == 200

    # IDOR Test: Customer 2 cannot view Customer 1's order
    view_c2_res = client.get(f"/api/orders/{order_id}", headers=c2_headers)
    assert view_c2_res.status_code == 403

    # Vendor 1 can view order containing their product
    v1_view_res = client.get(f"/api/orders/{order_id}", headers=v1_headers)
    assert v1_view_res.status_code == 200

    # Customer CANNOT change order status
    status_fail_res = client.patch(f"/api/orders/{order_id}/status", json={"order_status": "DELIVERED"}, headers=c1_headers)
    assert status_fail_res.status_code == 403

    # Vendor CAN update order status
    status_ok_res = client.patch(f"/api/orders/{order_id}/status", json={"order_status": "PROCESSING"}, headers=v1_headers)
    assert status_ok_res.status_code == 200
    assert status_ok_res.json()["order_status"] == "PROCESSING"
