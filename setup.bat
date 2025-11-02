@echo off
echo ========================================
echo Kerr Black Hole Renderer - Setup Script
echo ========================================
echo.

REM Check if vcpkg is installed
where vcpkg >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] vcpkg not found in PATH!
    echo Please install vcpkg and run: vcpkg integrate install
    echo Visit: https://github.com/Microsoft/vcpkg
    pause
    exit /b 1
)

echo [1/4] Installing dependencies via vcpkg...
vcpkg install glfw3:x64-windows glad:x64-windows

echo.
echo [2/4] Setting up ImGui...
if not exist "external\imgui" (
    echo Cloning ImGui repository...
    cd external
    git clone --depth 1 https://github.com/ocornut/imgui.git
    cd ..
) else (
    echo ImGui already exists.
)

echo.
echo [3/4] Checking GLAD...
if not exist "external\glad\include\glad\glad.h" (
    echo [WARNING] GLAD not found!
    echo Please generate GLAD loader:
    echo   1. Visit https://glad.dav1d.de/
    echo   2. Select: OpenGL 4.6, Core profile
    echo   3. Generate and download
    echo   4. Extract to external/glad/
    pause
)

echo.
echo [4/4] Creating build directory...
if not exist "build" mkdir build

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo   1. Ensure GLAD is set up in external/glad/
echo   2. Open Visual Studio Developer Command Prompt
echo   3. Run: build.bat
echo.
pause
