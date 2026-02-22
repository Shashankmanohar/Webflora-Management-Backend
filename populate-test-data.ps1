# Script to populate WebFlora Management System with test data

$baseUrl = "http://localhost:4002"

Write-Host "=== WebFlora Management - Test Data Population ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login as admin
Write-Host "Step 1: Logging in as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@webflora.com"
    password = "admin123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/login" -Method POST -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.token
    Write-Host "✓ Login successful! Token received." -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed. Please make sure admin account exists." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Step 2: Add Employees
Write-Host "`nStep 2: Adding sample employees..." -ForegroundColor Yellow

$employees = @(
    @{
        name = "Rajesh Kumar"
        email = "rajesh@webflora.com"
        password = "password123"
        role = "developer"
        phone = "9876543210"
        address = "Mumbai, Maharashtra"
        salary = 50000
    },
    @{
        name = "Priya Sharma"
        email = "priya@webflora.com"
        password = "password123"
        role = "designer"
        phone = "9876543211"
        address = "Delhi, India"
        salary = 45000
    },
    @{
        name = "Amit Patel"
        email = "amit@webflora.com"
        password = "password123"
        role = "manager"
        phone = "9876543212"
        address = "Ahmedabad, Gujarat"
        salary = 60000
    }
)

foreach ($emp in $employees) {
    try {
        $empBody = $emp | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$baseUrl/api/employee" -Method POST -Headers $headers -Body $empBody
        Write-Host "  ✓ Added employee: $($emp.name)" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Failed to add employee: $($emp.name)" -ForegroundColor Red
    }
}

# Step 3: Add Clients
Write-Host "`nStep 3: Adding sample clients..." -ForegroundColor Yellow

$clients = @(
    @{
        clientName = "Tech Solutions Pvt Ltd"
        contactNumber = "9123456789"
        email = "contact@techsolutions.com"
        address = "Bangalore, Karnataka"
        referenceNo = "CL001"
    },
    @{
        clientName = "Digital Marketing Co"
        contactNumber = "9123456790"
        email = "info@digitalmarketing.com"
        address = "Pune, Maharashtra"
        referenceNo = "CL002"
    },
    @{
        clientName = "E-Commerce Ventures"
        contactNumber = "9123456791"
        email = "hello@ecommerce.com"
        address = "Hyderabad, Telangana"
        referenceNo = "CL003"
    }
)

$clientIds = @()
foreach ($client in $clients) {
    try {
        $clientBody = $client | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$baseUrl/api/client" -Method POST -Headers $headers -Body $clientBody
        $clientIds += $result.client._id
        Write-Host "  ✓ Added client: $($client.clientName)" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Failed to add client: $($client.clientName)" -ForegroundColor Red
    }
}

# Step 4: Add Invoices
Write-Host "`nStep 4: Adding sample invoices..." -ForegroundColor Yellow

if ($clientIds.Count -gt 0) {
    $invoices = @(
        @{
            clientId = $clientIds[0]
            referenceNo = "CL001"
            invoiceNo = "INV001"
            amount = "50000"
            description = "Website Development"
            method = "Bank Transfer"
            date = (Get-Date).ToString("yyyy-MM-dd")
        },
        @{
            clientId = $clientIds[1]
            referenceNo = "CL002"
            invoiceNo = "INV002"
            amount = "35000"
            description = "SEO Services"
            method = "UPI"
            date = (Get-Date).ToString("yyyy-MM-dd")
        },
        @{
            clientId = $clientIds[2]
            referenceNo = "CL003"
            invoiceNo = "INV003"
            amount = "75000"
            description = "E-Commerce Platform Development"
            method = "Bank Transfer"
            date = (Get-Date).ToString("yyyy-MM-dd")
        }
    )

    foreach ($invoice in $invoices) {
        try {
            $invoiceBody = $invoice | ConvertTo-Json
            $result = Invoke-RestMethod -Uri "$baseUrl/api/invoice" -Method POST -Headers $headers -Body $invoiceBody
            Write-Host "  ✓ Added invoice: $($invoice.invoiceNo)" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Failed to add invoice: $($invoice.invoiceNo)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  ⚠ No clients available to create invoices" -ForegroundColor Yellow
}

Write-Host "`n=== Test Data Population Complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now:" -ForegroundColor White
Write-Host "1. Login to the frontend at http://localhost:5173" -ForegroundColor White
Write-Host "   Email: admin@webflora.com" -ForegroundColor White
Write-Host "   Password: admin123456" -ForegroundColor White
Write-Host "2. View Employees, Clients, and Invoices pages" -ForegroundColor White
Write-Host ""
