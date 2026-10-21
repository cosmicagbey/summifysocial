@echo off
echo ======================================================================
echo           Summify - Release Keystore Generation Tool
echo ======================================================================
echo.
echo This script will generate 'summify-release.keystore' for Google Play.
echo Make sure to remember the password and keystore alias you enter!
echo.

set KEYSTORE_FILE=summify-release.keystore
set ALIAS_NAME=summify-key

if exist "%KEYSTORE_FILE%" (
    echo [WARNING] %KEYSTORE_FILE% already exists in this folder!
    echo Delete or move it first if you want to generate a new one.
    pause
    exit /b
)

keytool -genkeypair -v -keystore "%KEYSTORE_FILE%" -alias "%ALIAS_NAME%" -keyalg RSA -keysize 2048 -validity 10000

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo [SUCCESS] Release keystore successfully created: %KEYSTORE_FILE%
    echo Keystore Alias: %ALIAS_NAME%
    echo.
    echo IMPORTANT: Keep this keystore file and its password in a SAFE BACKUP!
    echo Google Play requires this key for all future app updates.
    echo ======================================================================
) else (
    echo.
    echo [ERROR] Keystore generation failed. Ensure Java JDK is in your PATH.
)

pause
