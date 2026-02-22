@echo off
echo === Adding Test Data to WebFlora Management ===
echo.

REM Get token
echo Step 1: Logging in...
curl -s -X POST http://localhost:4002/api/admin/login -H "Content-Type: application/json" -d "{\"email\":\"admin@webflora.com\",\"password\":\"admin123456\"}" > temp_login.json
for /f "tokens=2 delims=:," %%a in ('findstr /C:"token" temp_login.json') do set TOKEN=%%a
set TOKEN=%TOKEN:"=%
set TOKEN=%TOKEN: =%
echo Login successful!
echo.

echo Step 2: Adding Employees...
curl -s -X POST http://localhost:4002/api/employee -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"name\":\"Rajesh Kumar\",\"email\":\"rajesh@webflora.com\",\"password\":\"password123\",\"role\":\"developer\",\"phone\":\"9876543210\",\"address\":\"Mumbai, Maharashtra\",\"salary\":50000}"
echo   - Added Rajesh Kumar

curl -s -X POST http://localhost:4002/api/employee -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"name\":\"Priya Sharma\",\"email\":\"priya@webflora.com\",\"password\":\"password123\",\"role\":\"designer\",\"phone\":\"9876543211\",\"address\":\"Delhi, India\",\"salary\":45000}"
echo   - Added Priya Sharma

curl -s -X POST http://localhost:4002/api/employee -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"name\":\"Amit Patel\",\"email\":\"amit@webflora.com\",\"password\":\"password123\",\"role\":\"manager\",\"phone\":\"9876543212\",\"address\":\"Ahmedabad, Gujarat\",\"salary\":60000}"
echo   - Added Amit Patel
echo.

echo Step 3: Adding Clients...
curl -s -X POST http://localhost:4002/api/client -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"clientName\":\"Tech Solutions Pvt Ltd\",\"contactNumber\":\"9123456789\",\"email\":\"contact@techsolutions.com\",\"address\":\"Bangalore, Karnataka\",\"referenceNo\":\"CL001\"}" > temp_client1.json
echo   - Added Tech Solutions Pvt Ltd

curl -s -X POST http://localhost:4002/api/client -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"clientName\":\"Digital Marketing Co\",\"contactNumber\":\"9123456790\",\"email\":\"info@digitalmarketing.com\",\"address\":\"Pune, Maharashtra\",\"referenceNo\":\"CL002\"}" > temp_client2.json
echo   - Added Digital Marketing Co

curl -s -X POST http://localhost:4002/api/client -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"clientName\":\"E-Commerce Ventures\",\"contactNumber\":\"9123456791\",\"email\":\"hello@ecommerce.com\",\"address\":\"Hyderabad, Telangana\",\"referenceNo\":\"CL003\"}" > temp_client3.json
echo   - Added E-Commerce Ventures
echo.

echo Step 4: Adding Invoices...
REM Extract client IDs from the response files
for /f "tokens=2 delims=:," %%a in ('findstr /C:"_id" temp_client1.json') do set CLIENT1=%%a
for /f "tokens=2 delims=:," %%a in ('findstr /C:"_id" temp_client2.json') do set CLIENT2=%%a
for /f "tokens=2 delims=:," %%a in ('findstr /C:"_id" temp_client3.json') do set CLIENT3=%%a

set CLIENT1=%CLIENT1:"=%
set CLIENT1=%CLIENT1: =%
set CLIENT2=%CLIENT2:"=%
set CLIENT2=%CLIENT2: =%
set CLIENT3=%CLIENT3:"=%
set CLIENT3=%CLIENT3: =%

curl -s -X POST http://localhost:4002/api/invoice -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"clientId\":\"%CLIENT1%\",\"referenceNo\":\"CL001\",\"invoiceNo\":\"INV001\",\"amount\":\"50000\",\"description\":\"Website Development\",\"method\":\"Bank Transfer\",\"date\":\"2026-02-06\"}"
echo   - Added Invoice INV001

curl -s -X POST http://localhost:4002/api/invoice -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"clientId\":\"%CLIENT2%\",\"referenceNo\":\"CL002\",\"invoiceNo\":\"INV002\",\"amount\":\"35000\",\"description\":\"SEO Services\",\"method\":\"UPI\",\"date\":\"2026-02-06\"}"
echo   - Added Invoice INV002

curl -s -X POST http://localhost:4002/api/invoice -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"clientId\":\"%CLIENT3%\",\"referenceNo\":\"CL003\",\"invoiceNo\":\"INV003\",\"amount\":\"75000\",\"description\":\"E-Commerce Platform Development\",\"method\":\"Bank Transfer\",\"date\":\"2026-02-06\"}"
echo   - Added Invoice INV003
echo.

REM Cleanup
del temp_login.json temp_client1.json temp_client2.json temp_client3.json 2>nul

echo === Test Data Added Successfully! ===
echo.
echo You can now login to the frontend at http://localhost:5173
echo Email: admin@webflora.com
echo Password: admin123456
echo.
pause
