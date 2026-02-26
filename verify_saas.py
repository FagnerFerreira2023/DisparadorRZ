import requests
import json

BASE_URL = "http://localhost:8787"

def test_login(email, password):
    print(f"\n[AUTH] Testing login for {email}...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    data = res.json()
    if data.get("ok"):
        print(f"  ✓ Login successful. Role: {data['user']['role']}")
        return data["token"]
    else:
        print(f"  ✗ Login failed: {data.get('error')}")
        return None

def test_route(name, method, path, token, expected_status):
    print(f"[RBAC/ISOLATION] {name} ({method} {path})")
    headers = {"Authorization": f"Bearer {token}"}
    if method == "GET":
        res = requests.get(f"{BASE_URL}{path}", headers=headers)
    elif method == "POST":
        res = requests.post(f"{BASE_URL}{path}", headers=headers, json={})
    
    status = res.status_code
    if status == expected_status:
        print(f"  ✓ Got {status} as expected.")
    else:
        print(f"  ✗ Unexpected status: {status} (Expected {expected_status})")
    return res.json()

def main():
    # 1. TEST SUPERADMIN
    super_token = test_login("admin@saas.local", "Admin@123")
    if super_token:
        test_route("Superadmin accesses Admin Metrics", "GET", "/admin/metrics", super_token, 200)
        test_route("Superadmin lists all tenants", "GET", "/admin/tenants", super_token, 200)

    # 2. TEST ADMIN TENANT
    admin_token = test_login("admin@tenant.local", "Demo@123")
    if admin_token:
        test_route("Admin Tenant accesses own users", "GET", "/v1/users", admin_token, 200)
        test_route("Admin Tenant TRIED to access Admin Metrics", "GET", "/admin/metrics", admin_token, 403)
        test_route("Admin Tenant lists own instances", "GET", "/v1/instances", admin_token, 200)

    # 3. TEST USER TENANT
    user_token = test_login("user@tenant.local", "User@123")
    if user_token:
        test_route("User Tenant lists own instances", "GET", "/v1/instances", user_token, 200)
        test_route("User Tenant TRIED to access User Management", "GET", "/v1/users", user_token, 403)

if __name__ == "__main__":
    main()
