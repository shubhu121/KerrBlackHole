@echo off
echo ========================================
echo Kerr Black Hole Renderer - Build Script
echo ========================================
echo.

REM Check for Visual Studio
where cl.exe >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Visual Studio compiler not found!
    echo Please run this script from "Developer Command Prompt for VS"
    pause
    exit /b 1
)

REM Check for CMake
where cmake >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] CMake not found in PATH!
    echo Please install CMake: https://cmake.org/download/
    pause
    exit /b 1
)

echo [1/3] Configuring CMake...
cd build
cmake .. -DCMAKE_TOOLCHAIN_FILE=%VCPKG_ROOT%\scripts\buildsystems\vcpkg.cmake -A x64
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] CMake configuration failed!
    cd ..
    pause
    exit /b 1
)

echo.
echo [2/3] Building project (Release)...
cmake --build . --config Release
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed!
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo Build successful!
echo ========================================
echo.
echo Executable location: build\Release\KerrBlackHole.exe
echo.
echo Run the program? (Y/N)
set /p choice=
if /i "%choice%"=="Y" (
    cd build\Release
    KerrBlackHole.exe
)
