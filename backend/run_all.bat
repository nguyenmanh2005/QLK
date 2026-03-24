@echo off
title Microservices Launcher
echo =========================================
echo       KHOI DONG CAC MICROSERVICES
echo =========================================

:: Thay đổi đường dẫn về thư mục backend
cd /d "%~dp0"

echo [1/8] Starting ApiGateway...
start "ApiGateway" cmd /k "title ApiGateway (5155) && dotnet run --project ApiGateway"

echo [2/8] Starting UserService...
start "UserService" cmd /k "title UserService (5001) && dotnet run --project UserService"

echo [3/8] Starting OrderService...
start "OrderService" cmd /k "title OrderService (5002) && dotnet run --project OrderService"

echo [4/8] Starting ProductService...
start "ProductService" cmd /k "title ProductService (5003) && dotnet run --project ProductService"

echo [5/8] Starting CartService...
start "CartService" cmd /k "title CartService (5200) && dotnet run --project CartService"

echo [6/8] Starting AdminService...
start "AdminService" cmd /k "title AdminService && dotnet run --project AdminService"

echo [7/8] Starting SellerService...
start "SellerService" cmd /k "title SellerService && dotnet run --project SellerService"

echo [8/8] Starting ShipperService...
start "ShipperService" cmd /k "title ShipperService && dotnet run --project ShipperService"

echo =========================================
echo   Tat ca cac service da duoc khoi chay!
echo   Moi service se mo trong 1 cua so rieng.
echo =========================================
pause
