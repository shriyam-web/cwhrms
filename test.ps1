$body = @{
  email = "john@test.com"
  password = "password123"
} | ConvertTo-Json

Write-Host "Testing login..."
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

$data = $response.Content | ConvertFrom-Json
Write-Host "Login Response:" -ForegroundColor Green
Write-Host ($data | ConvertTo-Json -Depth 10)

$token = $data.token

Write-Host "`nTesting GET employees with token..."
$getResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/employees" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $token"}

$employees = $getResponse.Content | ConvertFrom-Json
Write-Host "Employees Response:" -ForegroundColor Green
Write-Host ($employees | ConvertTo-Json -Depth 10)
