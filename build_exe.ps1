# Build script for Servant Sheet Creator desktop executable
# Requires: Python, pip, and PyInstaller installed
# Usage: powershell -ExecutionPolicy Bypass -File build_exe.ps1

param(
    [string]$Python = "python",
    [string]$DistDir = "dist",
    [string]$BuildDir = "build"
)

Write-Host "[1/5] Ensuring PyInstaller is installed" -ForegroundColor Cyan
& $Python -m pip install --upgrade pyinstaller
if ($LASTEXITCODE -ne 0) { Write-Host "PyInstaller install failed (exit $LASTEXITCODE)" -ForegroundColor Red; exit 1 }

Write-Host "[2/5] Cleaning previous build" -ForegroundColor Cyan
if (Test-Path $DistDir) { Remove-Item -Recurse -Force $DistDir }
if (Test-Path $BuildDir) { Remove-Item -Recurse -Force $BuildDir }

Write-Host "[3/5] Running PyInstaller" -ForegroundColor Cyan
# Collect templates and static assets
$specArgs = @(
    'run_app.py',
    '--name=ServantSheetCreator',
    '--onefile',
    '--add-data="templates;templates"',
    '--add-data="static;static"',
    '--add-data="images;images"',
    '--add-data="FGO Mode;FGO Mode"'
)
& $Python -m PyInstaller $specArgs
if ($LASTEXITCODE -ne 0) { Write-Host "PyInstaller build failed (exit $LASTEXITCODE)" -ForegroundColor Red; exit 1 }

Write-Host "[4/5] Build complete" -ForegroundColor Green
$exePath = Join-Path $DistDir 'ServantSheetCreator.exe'
if (Test-Path $exePath) {
    Write-Host "Executable created: $exePath" -ForegroundColor Green
} else {
    Write-Host "Executable not found. Check PyInstaller output." -ForegroundColor Red
    exit 1
}

Write-Host "[5/5] Done." -ForegroundColor Green
