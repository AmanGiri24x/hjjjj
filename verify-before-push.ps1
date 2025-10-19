# Verification Script - Run this before pushing to GitHub
# This ensures no large files or sensitive data will be pushed

Write-Host "=== DhanAillytics Pre-Push Verification ===" -ForegroundColor Cyan
Write-Host ""

$hasIssues = $false

# Check 1: Verify .gitignore exists
Write-Host "✓ Checking .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    Write-Host "  ✓ .gitignore found" -ForegroundColor Green
} else {
    Write-Host "  ✗ .gitignore missing!" -ForegroundColor Red
    $hasIssues = $true
}
Write-Host ""

# Check 2: Verify node_modules are ignored
Write-Host "✓ Checking if node_modules are ignored..." -ForegroundColor Yellow
$nodeModulesTracked = git ls-files | Select-String "node_modules"
if ($nodeModulesTracked) {
    Write-Host "  ✗ node_modules are being tracked!" -ForegroundColor Red
    Write-Host "  Files found:" -ForegroundColor Red
    $nodeModulesTracked | Select-Object -First 5
    $hasIssues = $true
} else {
    Write-Host "  ✓ node_modules properly ignored" -ForegroundColor Green
}
Write-Host ""

# Check 3: Verify .env files are ignored
Write-Host "✓ Checking if .env files are ignored..." -ForegroundColor Yellow
$envTracked = git ls-files | Select-String "\.env"
if ($envTracked) {
    Write-Host "  ✗ .env files are being tracked!" -ForegroundColor Red
    Write-Host "  Files found:" -ForegroundColor Red
    $envTracked
    $hasIssues = $true
} else {
    Write-Host "  ✓ .env files properly ignored" -ForegroundColor Green
}
Write-Host ""

# Check 4: Check for large files in staging
Write-Host "✓ Checking for large files (>50MB)..." -ForegroundColor Yellow
$largeFiles = git ls-files | ForEach-Object { 
    if (Test-Path $_) { 
        $item = Get-Item $_
        if ($item.Length -gt 50MB) { 
            [PSCustomObject]@{
                File = $_.Replace('\', '/')
                SizeMB = [math]::Round($item.Length/1MB, 2)
            }
        } 
    } 
}

if ($largeFiles) {
    Write-Host "  ✗ Large files found:" -ForegroundColor Red
    $largeFiles | Format-Table -AutoSize
    $hasIssues = $true
} else {
    Write-Host "  ✓ No large files detected" -ForegroundColor Green
}
Write-Host ""

# Check 5: Check for common sensitive patterns
Write-Host "✓ Checking for sensitive data patterns..." -ForegroundColor Yellow
$sensitivePatterns = @(
    "password\s*=",
    "api[_-]?key\s*=",
    "secret\s*=",
    "token\s*="
)

$sensitiveFound = $false
foreach ($pattern in $sensitivePatterns) {
    $matches = git grep -i -E $pattern 2>$null
    if ($matches) {
        if (-not $sensitiveFound) {
            Write-Host "  ⚠ Potential sensitive data found:" -ForegroundColor Yellow
            $sensitiveFound = $true
        }
        Write-Host "    Pattern: $pattern" -ForegroundColor Yellow
        $matches | Select-Object -First 3 | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
    }
}

if (-not $sensitiveFound) {
    Write-Host "  ✓ No obvious sensitive patterns detected" -ForegroundColor Green
}
Write-Host ""

# Check 6: Verify git status
Write-Host "✓ Checking git status..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host "  ℹ Uncommitted changes:" -ForegroundColor Cyan
    $status | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
} else {
    Write-Host "  ✓ Working tree clean" -ForegroundColor Green
}
Write-Host ""

# Check 7: Count files to be pushed
Write-Host "✓ Counting files in repository..." -ForegroundColor Yellow
$fileCount = (git ls-files | Measure-Object).Count
Write-Host "  Total files: $fileCount" -ForegroundColor Cyan

# Estimate repository size
$totalSize = 0
git ls-files | ForEach-Object { 
    if (Test-Path $_) { 
        $totalSize += (Get-Item $_).Length 
    } 
}
$totalSizeMB = [math]::Round($totalSize / 1MB, 2)
Write-Host "  Estimated size: $totalSizeMB MB" -ForegroundColor Cyan
Write-Host ""

# Check 8: Verify remote
Write-Host "✓ Checking remote repository..." -ForegroundColor Yellow
$remote = git remote get-url origin 2>$null
if ($remote) {
    Write-Host "  Remote: $remote" -ForegroundColor Cyan
} else {
    Write-Host "  ✗ No remote configured!" -ForegroundColor Red
    $hasIssues = $true
}
Write-Host ""

# Summary
Write-Host "=== Verification Summary ===" -ForegroundColor Cyan
Write-Host ""

if ($hasIssues) {
    Write-Host "❌ Issues found! Please fix them before pushing." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "  - Remove large files: git rm --cached <file>" -ForegroundColor White
    Write-Host "  - Add to .gitignore and commit" -ForegroundColor White
    Write-Host "  - Use fresh-start.ps1 for a clean repository" -ForegroundColor White
} else {
    Write-Host "✅ All checks passed! Safe to push." -ForegroundColor Green
    Write-Host ""
    Write-Host "To push to GitHub, run:" -ForegroundColor Cyan
    Write-Host "  git push origin main" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use the fresh-start.ps1 script for a clean push:" -ForegroundColor Cyan
    Write-Host "  .\fresh-start.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "=== End of Verification ===" -ForegroundColor Cyan
Write-Host ""
