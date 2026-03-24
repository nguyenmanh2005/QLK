@echo off
title Frontend Microservices Launcher
echo =========================================
echo       KHOI DONG CAC FRONTEND APPS
echo =========================================

:: Đổi đường dẫn về thư mục chứa file .bat (Cụ thể là thư mục frontend)
cd /d "%~dp0"

echo [1/4] Starting Admin App...
start "Admin App" cmd /k "title Admin App && cd admin-app && npm run dev"

echo [2/4] Starting Shop App...
start "Shop App" cmd /k "title Shop App && cd shop-app && npm run dev"

echo [3/4] Starting Seller App...
start "Seller App" cmd /k "title Seller App && cd seller-app && npm run dev"

echo [4/4] Starting Shipper App...
start "Shipper App" cmd /k "title Shipper App && cd shipper-app && npm run dev"

echo =========================================
echo   Tat ca 4 Frontend (React/Next JS) da duoc khoi chay!
echo   Chu y: Vui long doi may tinh bien dich NodeJS trong vai phut dau.
echo   Moi Frontend se mo ra 1 man hinh den rieng biet.
echo =========================================
pause
