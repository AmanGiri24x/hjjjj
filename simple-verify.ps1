# Simple Verification Script
Write-Host "=== Checking Repository Status ===" -ForegroundColor Cyan
Write-Host ""

# Check for large files
Write-Host "Checking for large files..." -ForegroundColor Yellow
$largeCount = 0
git ls-files | ForEach-Object { 
    if (Test-Path $_) { 
        $item = Get-Item $_
        if ($item.Length -gt 50MB) { 
            Write-Host "  Large file: $_ ($([math]::Round($item.Length/1MB,2)) MB)" -ForegroundColor Red
            $largeCount++
        } 
    } 
}

if ($largeCount -eq 0) {
    Write-Host "  No large files found" -ForegroundColor Green
}
Write-Host ""

# Check git status
Write-Host "Git Status:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Check remote
Write-Host "Remote Repository:" -ForegroundColor Yellow
git remote -v
Write-Host ""

Write-Host "=== Verification Complete ===" -ForegroundColor Green
