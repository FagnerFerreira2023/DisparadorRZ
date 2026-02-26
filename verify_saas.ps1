$baseUrl = "http://localhost:8787"

function Test-Login($email, $password) {
    Write-Host "`n[AUTH] Testando login para $email..." -ForegroundColor Cyan
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
        if ($res.ok) {
            Write-Host "  ✓ Login realizado com sucesso. Role: $($res.user.role)" -ForegroundColor Green
            return $res.token
        }
    } catch {
        Write-Host "  ✗ Falha no login: $_" -ForegroundColor Red
    }
    return $null
}

function Test-Route($name, $method, $path, $token, $expectedStatus) {
    Write-Host "[RBAC/ISOLATION] $name ($method $path)" -ForegroundColor Cyan
    $headers = @{ Authorization = "Bearer $token" }
    try {
        $res = Invoke-WebRequest -Uri "$baseUrl$path" -Method $method -Headers $headers -ContentType "application/json" -ErrorAction SilentlyContinue
        $status = $res.StatusCode
        if ($status -eq $expectedStatus) {
            Write-Host "  ✓ Status $status recebido como esperado." -ForegroundColor Green
        } else {
            Write-Host "  ✗ Status inesperado: $status (Esperado $expectedStatus)" -ForegroundColor Red
        }
    } catch {
        $status = $_.Exception.Response.StatusCode
        if ($status -eq $expectedStatus) {
             Write-Host "  ✓ Status $status recebido conforme esperado (Erro Capturado)." -ForegroundColor Green
        } else {
             Write-Host "  ✗ Erro inesperado: $status (Esperado $expectedStatus)" -ForegroundColor Red
        }
    }
}

# 1. TESTE SUPERADMIN
$superToken = Test-Login "admin@saas.local" "Admin@123"
if ($superToken) {
    Test-Route "Superadmin acessa Métricas" "GET" "/admin/metrics" $superToken 200
    Test-Route "Superadmin lista tenants" "GET" "/admin/tenants" $superToken 200
}

# 2. TESTE ADMIN TENANT
$adminToken = Test-Login "admin@tenant.local" "Demo@123"
if ($adminToken) {
    Test-Route "Admin Tenant acessa próprios usuários" "GET" "/v1/users" $adminToken 200
    Test-Route "Admin Tenant tenta acessar Métricas do Sistema" "GET" "/admin/metrics" $adminToken 403
    Test-Route "Admin Tenant lista próprias instâncias" "GET" "/v1/instances" $adminToken 200
}

# 3. TESTE USER TENANT
$userToken = Test-Login "user@tenant.local" "User@123"
if ($userToken) {
    Test-Route "User Tenant lista próprias instâncias" "GET" "/v1/instances" $userToken 200
    Test-Route "User Tenant tenta acessar Gestão de Usuários" "GET" "/v1/users" $userToken 403
}
