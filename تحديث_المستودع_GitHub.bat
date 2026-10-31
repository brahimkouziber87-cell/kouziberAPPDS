@echo off
chcp 65001 > nul
echo ========================================================
echo        تحديث مستودع kouziberAPPDS على GitHub
echo ========================================================
echo.
git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo [تنبيه] إذا طُلب منك تسجيل الدخول، أدخل حساب GitHub
    echo أو Personal Access Token (PAT) ككلمة مرور.
    echo.
) else (
    echo.
    echo [نجاح] تم تحديث المستودع بنجاح على GitHub!
)
pause
