@echo off
chcp 65001 >nul
title Kouziber Pedagogical Math - Desktop & Tablet Edition
cd /d "%~dp0"

echo ========================================================
echo   منصة الأستاذ كوزيبر البيداغوجية للرياضيات
echo   إصدار سطح المكتب والألواح الإلكترونية (Desktop ^& Tablet)
echo ========================================================
echo.

if not exist "dist\index.html" (
    echo جاري بناء نسخة الإنتاج لأول مرة...
    call npm.cmd run build
)

echo جاري تشغيل الخادم المحلي وفتح نافذة التطبيق المستقلة...
start "" cmd /c "timeout /t 2 >nul & start msedge --app=http://localhost:4173 --start-maximized 2>nul || start chrome --app=http://localhost:4173 --start-maximized 2>nul || start http://localhost:4173"
call npx.cmd vite preview --port 4173 --host
