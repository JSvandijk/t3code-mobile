@echo off
setlocal enabledelayedexpansion

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

if not defined JAVA_HOME if exist "C:\Program Files\Android\Android Studio\jbr" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
)
if not defined ANDROID_SDK if defined ANDROID_SDK_ROOT (
    set "ANDROID_SDK=%ANDROID_SDK_ROOT%"
)
if not defined ANDROID_SDK if defined ANDROID_HOME (
    set "ANDROID_SDK=%ANDROID_HOME%"
)
if not defined ANDROID_SDK (
    set "ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk"
)

set "BUILD_TOOLS_VERSION=36.1.0"
set "ANDROID_PLATFORM=android-35"
set "BUILD_TOOLS=%ANDROID_SDK%\build-tools\%BUILD_TOOLS_VERSION%"
set "PLATFORM=%ANDROID_SDK%\platforms\%ANDROID_PLATFORM%"

set "PROJECT=%ROOT%\apk"
set "SRC=%PROJECT%\app\src\main"
set "BUILD=%PROJECT%\build"
set "SIGNING=%PROJECT%\signing"
set "GEN=%BUILD%\gen"
set "CLASSES=%BUILD%\classes"
set "OUTPUT=%BUILD%\output"
set "COMPILED_RES=%BUILD%\compiled_res"
set "DEX=%BUILD%\dex"
set "DEV_KEYSTORE=%SIGNING%\dev.keystore"
set "RELEASE_KEYSTORE_PATH="
set "OLD_RELEASE_KEYSTORE_PATH="
set "SIGNING_LINEAGE_INPUT_PATH="
set "SIGNING_LINEAGE_OUTPUT_PATH=%OUTPUT%\signing.lineage"
set "SIGNING_MODE=dev"
set "SIGNING_ROTATION_MODE=false"
set "PACKAGE_VERSION="
set "APK_VERSION_NAME="
set "APK_VERSION_CODE="

if not exist "%SIGNING%" mkdir "%SIGNING%"

if not exist "%JAVA_HOME%\bin\javac.exe" (
    echo JAVA_HOME is not configured correctly.
    echo Expected: %%JAVA_HOME%%\bin\javac.exe
    exit /b 1
)

if not exist "%BUILD_TOOLS%\aapt2.exe" (
    echo Android build-tools %BUILD_TOOLS_VERSION% not found under %ANDROID_SDK%.
    exit /b 1
)

if not exist "%PLATFORM%\android.jar" (
    echo Android platform %ANDROID_PLATFORM% not found under %ANDROID_SDK%.
    exit /b 1
)

set "PATH=%JAVA_HOME%\bin;%PATH%"

for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-Content '%ROOT%\package.json' -Raw | ConvertFrom-Json).version"`) do (
    set "PACKAGE_VERSION=%%i"
)

if not defined PACKAGE_VERSION (
    echo Failed to read the app version from package.json.
    exit /b 1
)

if defined APK_VERSION_NAME (
    set "APK_VERSION_NAME=%APK_VERSION_NAME%"
) else (
    set "APK_VERSION_NAME=%PACKAGE_VERSION%"
)

for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "$version='%APK_VERSION_NAME%'.Trim(); if ($version -notmatch '^\d+\.\d+\.\d+$') { throw 'APK_VERSION_NAME must use x.y.z format.' }; $parts = $version.Split('.'); $code = ([int]$parts[0] * 10000) + ([int]$parts[1] * 100) + [int]$parts[2]; if ($code -lt 1 -or $code -gt 2147483647) { throw 'APK_VERSION_CODE is out of range.' }; Write-Output $code"`) do (
    set "APK_VERSION_CODE=%%i"
)

if not defined APK_VERSION_CODE (
    echo Failed to derive APK_VERSION_CODE from %APK_VERSION_NAME%.
    exit /b 1
)

if defined APK_KEYSTORE_BASE64 (
    set "RELEASE_KEYSTORE_PATH=%SIGNING%\release.keystore"
    powershell -NoProfile -Command "[IO.File]::WriteAllBytes('%SIGNING%\release.keystore', [Convert]::FromBase64String($env:APK_KEYSTORE_BASE64))"
    if errorlevel 1 (
        echo Failed to decode APK_KEYSTORE_BASE64.
        exit /b 1
    )
) else if defined APK_KEYSTORE_PATH (
    set "RELEASE_KEYSTORE_PATH=%APK_KEYSTORE_PATH%"
) else if exist "%SIGNING%\release.keystore" (
    set "RELEASE_KEYSTORE_PATH=%SIGNING%\release.keystore"
)

if defined APK_OLD_KEYSTORE_BASE64 (
    set "OLD_RELEASE_KEYSTORE_PATH=%SIGNING%\old-release.keystore"
    powershell -NoProfile -Command "[IO.File]::WriteAllBytes('%SIGNING%\old-release.keystore', [Convert]::FromBase64String($env:APK_OLD_KEYSTORE_BASE64))"
    if errorlevel 1 (
        echo Failed to decode APK_OLD_KEYSTORE_BASE64.
        exit /b 1
    )
) else if defined APK_OLD_KEYSTORE_PATH (
    set "OLD_RELEASE_KEYSTORE_PATH=%APK_OLD_KEYSTORE_PATH%"
)

if defined APK_SIGNING_LINEAGE_BASE64 (
    set "SIGNING_LINEAGE_INPUT_PATH=%SIGNING%\provided-signing.lineage"
    powershell -NoProfile -Command "[IO.File]::WriteAllBytes('%SIGNING%\provided-signing.lineage', [Convert]::FromBase64String($env:APK_SIGNING_LINEAGE_BASE64))"
    if errorlevel 1 (
        echo Failed to decode APK_SIGNING_LINEAGE_BASE64.
        exit /b 1
    )
) else if defined APK_SIGNING_LINEAGE_PATH (
    set "SIGNING_LINEAGE_INPUT_PATH=%APK_SIGNING_LINEAGE_PATH%"
)

if defined RELEASE_KEYSTORE_PATH (
    if not defined APK_KEYSTORE_PASSWORD (
        echo APK_KEYSTORE_PASSWORD is required when using a release keystore.
        exit /b 1
    )
    if not defined APK_KEY_ALIAS (
        echo APK_KEY_ALIAS is required when using a release keystore.
        exit /b 1
    )
    if not defined APK_KEY_PASSWORD (
        echo APK_KEY_PASSWORD is required when using a release keystore.
        exit /b 1
    )
    set "SIGNING_MODE=release"
) else (
    if /I "%APK_REQUIRE_RELEASE_SIGNING%"=="true" (
        echo Release signing is required but no release keystore was provided.
        exit /b 1
    )
)

if defined OLD_RELEASE_KEYSTORE_PATH (
    if /I not "%SIGNING_MODE%"=="release" (
        echo A current release keystore is required when configuring signing rotation.
        exit /b 1
    )
    if not defined APK_OLD_KEYSTORE_PASSWORD (
        echo APK_OLD_KEYSTORE_PASSWORD is required when using an old release keystore.
        exit /b 1
    )
    if not defined APK_OLD_KEY_ALIAS (
        echo APK_OLD_KEY_ALIAS is required when using an old release keystore.
        exit /b 1
    )
    if not defined APK_OLD_KEY_PASSWORD (
        echo APK_OLD_KEY_PASSWORD is required when using an old release keystore.
        exit /b 1
    )
    set "SIGNING_ROTATION_MODE=true"
) else if defined SIGNING_LINEAGE_INPUT_PATH (
    echo APK_SIGNING_LINEAGE_PATH or APK_SIGNING_LINEAGE_BASE64 requires the previous release signer.
    exit /b 1
)

if /I "%SIGNING_ROTATION_MODE%"=="true" (
    if not defined APK_ROTATION_MIN_SDK_VERSION (
        set "APK_ROTATION_MIN_SDK_VERSION=28"
    )
    for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "$value='%APK_ROTATION_MIN_SDK_VERSION%'.Trim(); if ($value -notmatch '^\d+$') { throw 'APK_ROTATION_MIN_SDK_VERSION must be an integer.' }; if ([int]$value -lt 28) { throw 'APK_ROTATION_MIN_SDK_VERSION must be at least 28.' }; Write-Output $value"`) do (
        set "APK_ROTATION_MIN_SDK_VERSION=%%i"
    )
    if not defined APK_ROTATION_MIN_SDK_VERSION (
        echo Failed to validate APK_ROTATION_MIN_SDK_VERSION.
        exit /b 1
    )
)

echo [1/8] Cleaning build directory
if exist "%BUILD%" rmdir /s /q "%BUILD%"
mkdir "%GEN%"
mkdir "%CLASSES%"
mkdir "%OUTPUT%"
mkdir "%COMPILED_RES%"
mkdir "%DEX%"

echo [2/8] Compiling Android resources
for /r "%SRC%\res" %%f in (*.xml *.png) do (
    "%BUILD_TOOLS%\aapt2.exe" compile "%%f" -o "%COMPILED_RES%" >nul 2>&1
    if errorlevel 1 (
        echo Failed to compile resource: %%f
        exit /b 1
    )
)

echo [3/8] Linking resources
set "FLAT_FILES="
for %%f in ("%COMPILED_RES%\*.flat") do (
    set "FLAT_FILES=!FLAT_FILES! "%%f""
)

"%BUILD_TOOLS%\aapt2.exe" link ^
    -o "%OUTPUT%\app.unsigned.apk" ^
    -I "%PLATFORM%\android.jar" ^
    --manifest "%SRC%\AndroidManifest.xml" ^
    --java "%GEN%" ^
    --version-code "%APK_VERSION_CODE%" ^
    --version-name "%APK_VERSION_NAME%" ^
    --min-sdk-version 24 ^
    --target-sdk-version 35 ^
    !FLAT_FILES!

if errorlevel 1 (
    echo AAPT2 link failed.
    exit /b 1
)

echo [4/8] Compiling Java sources
dir /s /b "%SRC%\java\*.java" > "%BUILD%\sources.txt"
dir /s /b "%GEN%\*.java" >> "%BUILD%\sources.txt"

javac -source 11 -target 11 ^
    -classpath "%PLATFORM%\android.jar" ^
    -d "%CLASSES%" ^
    @"%BUILD%\sources.txt"

if errorlevel 1 (
    echo Java compilation failed.
    exit /b 1
)

echo [5/8] Building DEX
set "CLASS_FILES="
for /r "%CLASSES%" %%f in (*.class) do (
    set "CLASS_FILES=!CLASS_FILES! "%%f""
)

call "%BUILD_TOOLS%\d8.bat" --min-api 24 --output "%DEX%" --lib "%PLATFORM%\android.jar" !CLASS_FILES!
if errorlevel 1 (
    echo D8 failed.
    exit /b 1
)

if not exist "%DEX%\classes.dex" (
    echo DEX output was not created.
    exit /b 1
)

echo [6/8] Packaging APK
copy "%OUTPUT%\app.unsigned.apk" "%OUTPUT%\app.withdex.apk" >nul
pushd "%DEX%"
"%JAVA_HOME%\bin\jar.exe" uf "%OUTPUT%\app.withdex.apk" classes.dex
popd
"%BUILD_TOOLS%\zipalign.exe" -f 4 "%OUTPUT%\app.withdex.apk" "%OUTPUT%\app.aligned.apk"

if errorlevel 1 (
    echo zipalign failed.
    exit /b 1
)

echo [7/8] Preparing signing key
if /I "%SIGNING_MODE%"=="release" (
    if not exist "%RELEASE_KEYSTORE_PATH%" (
        echo Release keystore not found: %RELEASE_KEYSTORE_PATH%
        exit /b 1
    )
    if /I "%SIGNING_ROTATION_MODE%"=="true" (
        if not exist "%OLD_RELEASE_KEYSTORE_PATH%" (
            echo Old release keystore not found: %OLD_RELEASE_KEYSTORE_PATH%
            exit /b 1
        )
        if defined SIGNING_LINEAGE_INPUT_PATH (
            if not exist "%SIGNING_LINEAGE_INPUT_PATH%" (
                echo Signing lineage not found: %SIGNING_LINEAGE_INPUT_PATH%
                exit /b 1
            )
            copy "%SIGNING_LINEAGE_INPUT_PATH%" "%SIGNING_LINEAGE_OUTPUT_PATH%" >nul
        ) else (
            call "%BUILD_TOOLS%\apksigner.bat" rotate ^
                --out "%SIGNING_LINEAGE_OUTPUT_PATH%" ^
                --old-signer ^
                --ks "%OLD_RELEASE_KEYSTORE_PATH%" ^
                --ks-key-alias "%APK_OLD_KEY_ALIAS%" ^
                --ks-pass env:APK_OLD_KEYSTORE_PASSWORD ^
                --key-pass env:APK_OLD_KEY_PASSWORD ^
                --set-installed-data true ^
                --new-signer ^
                --ks "%RELEASE_KEYSTORE_PATH%" ^
                --ks-key-alias "%APK_KEY_ALIAS%" ^
                --ks-pass env:APK_KEYSTORE_PASSWORD ^
                --key-pass env:APK_KEY_PASSWORD
            if errorlevel 1 (
                echo Failed to generate a signing lineage for key rotation.
                exit /b 1
            )
        )
    )
) else (
    if not exist "%DEV_KEYSTORE%" (
        keytool -genkeypair -v ^
            -keystore "%DEV_KEYSTORE%" ^
            -alias t3code-mobile-dev ^
            -keyalg RSA ^
            -keysize 2048 ^
            -validity 10000 ^
            -storepass android ^
            -keypass android ^
            -dname "CN=T3 Code Mobile Dev, O=Local Build, L=Local"
    )
)

echo [8/8] Signing APK
if /I "%SIGNING_MODE%"=="release" (
    if /I "%SIGNING_ROTATION_MODE%"=="true" (
        call "%BUILD_TOOLS%\apksigner.bat" sign ^
            --lineage "%SIGNING_LINEAGE_OUTPUT_PATH%" ^
            --rotation-min-sdk-version "%APK_ROTATION_MIN_SDK_VERSION%" ^
            --ks "%OLD_RELEASE_KEYSTORE_PATH%" ^
            --ks-key-alias "%APK_OLD_KEY_ALIAS%" ^
            --ks-pass env:APK_OLD_KEYSTORE_PASSWORD ^
            --key-pass env:APK_OLD_KEY_PASSWORD ^
            --next-signer ^
            --ks "%RELEASE_KEYSTORE_PATH%" ^
            --ks-key-alias "%APK_KEY_ALIAS%" ^
            --ks-pass env:APK_KEYSTORE_PASSWORD ^
            --key-pass env:APK_KEY_PASSWORD ^
            --out "%OUTPUT%\T3Code-v%APK_VERSION_NAME%.apk" ^
            "%OUTPUT%\app.aligned.apk"
    ) else (
        call "%BUILD_TOOLS%\apksigner.bat" sign ^
            --ks "%RELEASE_KEYSTORE_PATH%" ^
            --ks-key-alias "%APK_KEY_ALIAS%" ^
            --ks-pass env:APK_KEYSTORE_PASSWORD ^
            --key-pass env:APK_KEY_PASSWORD ^
            --out "%OUTPUT%\T3Code-v%APK_VERSION_NAME%.apk" ^
            "%OUTPUT%\app.aligned.apk"
    )
) else (
    echo Using a local development signing key. Do not publish this APK as a release.
    call "%BUILD_TOOLS%\apksigner.bat" sign ^
        --ks "%DEV_KEYSTORE%" ^
        --ks-key-alias t3code-mobile-dev ^
        --ks-pass pass:android ^
        --key-pass pass:android ^
        --out "%OUTPUT%\T3Code-v%APK_VERSION_NAME%.apk" ^
        "%OUTPUT%\app.aligned.apk"
)

if errorlevel 1 (
    echo APK signing failed.
    exit /b 1
)

copy "%OUTPUT%\T3Code-v%APK_VERSION_NAME%.apk" "%OUTPUT%\T3Code.apk" >nul
copy "%OUTPUT%\T3Code-v%APK_VERSION_NAME%.apk" "%ROOT%\T3Code.apk" >nul
copy "%OUTPUT%\T3Code-v%APK_VERSION_NAME%.apk" "%ROOT%\T3Code-v%APK_VERSION_NAME%.apk" >nul

echo.
echo APK built successfully:
echo   %OUTPUT%\T3Code-v%APK_VERSION_NAME%.apk
echo.
echo Copied to:
echo   %ROOT%\T3Code.apk
echo   %ROOT%\T3Code-v%APK_VERSION_NAME%.apk
