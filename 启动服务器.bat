@echo off
chcp 65001 >nul
cd /d "%~dp0"
title DeepSeek 手机版 - 本地服务器

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   未找到 Node.js。
  echo   请先安装 Node.js 18 或更高版本：https://nodejs.org/
  echo.
  pause
  exit /b 1
)

echo.
echo   正在启动 DeepSeek 手机版本地服务器...
echo.
node server.mjs --port 8080 --open

echo.
pause
