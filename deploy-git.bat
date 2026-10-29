@echo off
echo ========================================================
echo   Persiapan Push Project CBT Online ke GitHub
echo ========================================================

git init
git add .
git commit -m "feat: CBT Online AI Studio 2.0 with Gemini & Deep Curriculum Engine"
git branch -M main

echo.
echo ========================================================
echo   Commit lokal selesai!
echo.
echo   Silakan jalankan perintah ini (ganti URL dengan repo Anda):
echo   git remote add origin https://github.com/USERNAME/cbt-online.git
echo   git push -u origin main
echo ========================================================
pause
