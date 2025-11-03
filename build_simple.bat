@echo off
echo ========================================
echo Kerr Black Hole - Simple Build
echo ========================================

REM Try to find g++ or use clang++
where g++ >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set COMPILER=g++
) else (
    where clang >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set COMPILER=clang++
    ) else (
        echo [ERROR] No C++ compiler found! Please install MinGW or Visual Studio
        pause
        exit /b 1
    )
)

echo Found compiler: %COMPILER%
echo.

echo [1/2] Compiling main.cpp...
%COMPILER% -std=c++17 -O3 -o KerrBlackHole.exe main.cpp -lglfw -lglad -lGL -limgui -lopengl32 -lgdi32
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed!
    pause
    exit /b 1
)

echo [2/2] Build successful!
echo.
echo Run the program? (Y/N)
set /p choice=
if /i "%choice%"=="Y" (
    KerrBlackHole.exe
)
