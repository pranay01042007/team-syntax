def test_cart_workflow(client, test_users, auth_headers):
    headers = auth_headers(test_users["customer1"])
    p1 = test_users["product1"]

    # 1. Add item to cart
    add_res = client.post("/api/cart/items", json={"product_id": p1.id, "quantity": 2}, headers=headers)
    assert add_res.status_code == 201
    cart_data = add_res.json()
    assert len(cart_data["items"]) == 1
    assert cart_data["items"][0]["quantity"] == 2
    assert cart_data["total_amount"] == round(p1.price * 2, 2)
    cart_item_id = cart_data["items"][0]["id"]

    # 2. Update quantity
    update_res = client.put(f"/api/cart/items/{cart_item_id}", json={"quantity": 3}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["items"][0]["quantity"] == 3
    assert update_res.json()["total_amount"] == round(p1.price * 3, 2)

    # 3. Exceed stock rejected
    excess_res = client.put(f"/api/cart/items/{cart_item_id}", json={"quantity": 999}, headers=headers)
    assert excess_res.status_code == 409

    # 4. Remove item
    del_res = client.delete(f"/api/cart/items/{cart_item_id}", headers=headers)
    assert del_res.status_code == 200
    assert len(del_res.json()["items"]) == 0
    assert del_res.json()["total_amount"] == 0.0
