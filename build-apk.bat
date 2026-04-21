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
set "DEBUG_KEYSTORE=%SIGNING%\debug.keystore"

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

echo [1/8] Cleaning build directory
if exist "%BUILD%" rmdir /s /q "%BUILD%"
mkdir "%GEN%"
mkdir "%CLASSES%"
mkdir "%OUTPUT%"
mkdir "%COMPILED_RES%"
mkdir "%DEX%"
if not exist "%SIGNING%" mkdir "%SIGNING%"

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
if not exist "%DEBUG_KEYSTORE%" (
    keytool -genkeypair -v ^
        -keystore "%DEBUG_KEYSTORE%" ^
        -alias t3code-mobile ^
        -keyalg RSA ^
        -keysize 2048 ^
        -validity 10000 ^
        -storepass t3code123 ^
        -keypass t3code123 ^
        -dname "CN=T3 Code Mobile, O=JSvandijk, L=Remote"
)

echo [8/8] Signing APK
call "%BUILD_TOOLS%\apksigner.bat" sign ^
    --ks "%DEBUG_KEYSTORE%" ^
    --ks-key-alias t3code-mobile ^
    --ks-pass pass:t3code123 ^
    --key-pass pass:t3code123 ^
    --out "%OUTPUT%\T3Code.apk" ^
    "%OUTPUT%\app.aligned.apk"

if errorlevel 1 (
    echo APK signing failed.
    exit /b 1
)

copy "%OUTPUT%\T3Code.apk" "%ROOT%\T3Code.apk" >nul

echo.
echo APK built successfully:
echo   %OUTPUT%\T3Code.apk
echo.
echo Copied to:
echo   %ROOT%\T3Code.apk
