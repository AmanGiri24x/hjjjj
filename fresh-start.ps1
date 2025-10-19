# DhanAillytics - Fresh Start Script (RECOMMENDED)
# This script creates a fresh git repository without the large file history

Write-Host "=== DhanAillytics Fresh Start Script ===" -ForegroundColor Cyan
Write-Host "This is the RECOMMENDED approach - it's faster and cleaner!" -ForegroundColor Green
Write-Host ""

# Step 1: Backup current .git folder
Write-Host "Step 1: Backing up current .git folder..." -ForegroundColor Yellow
if (Test-Path ".git") {
    if (Test-Path ".git-backup") {
        Remove-Item ".git-backup" -Recurse -Force
    }
    Move-Item ".git" ".git-backup"
    Write-Host "✓ Backed up to .git-backup" -ForegroundColor Green
} else {
    Write-Host "✓ No existing .git folder found" -ForegroundColor Green
}
Write-Host ""

# Step 2: Initialize fresh repository
Write-Host "Step 2: Initializing fresh repository..." -ForegroundColor Yellow
git init
git branch -M main
Write-Host "✓ Fresh repository initialized" -ForegroundColor Green
Write-Host ""

# Step 3: Add remote
Write-Host "Step 3: Adding GitHub remote..." -ForegroundColor Yellow
git remote add origin https://github.com/AmanGiri24x/hjjjj.git
Write-Host "✓ Remote added" -ForegroundColor Green
Write-Host ""

# Step 4: Stage all files (respecting .gitignore)
Write-Host "Step 4: Staging files..." -ForegroundColor Yellow
git add .
Write-Host "✓ Files staged" -ForegroundColor Green
Write-Host ""

# Step 5: Show what will be committed
Write-Host "Step 5: Files to be committed:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Step 6: Check for large files
Write-Host "Step 6: Checking for large files..." -ForegroundColor Yellow
$largeFiles = git ls-files | ForEach-Object { 
    if (Test-Path $_) { 
        $item = Get-Item $_
        if ($item.Length -gt 50MB) { 
            [PSCustomObject]@{
                File = $item.Name
                SizeMB = [math]::Round($item.Length/1MB, 2)
            }
        } 
    } 
}

if ($largeFiles) {
    Write-Host "⚠ Warning: Large files found:" -ForegroundColor Red
    $largeFiles | Format-Table -AutoSize
    Write-Host ""
    Write-Host "These files may cause issues. Consider adding them to .gitignore" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (yes/no)"
    if ($continue -ne "yes") {
        Write-Host "Aborted. Please review and remove large files." -ForegroundColor Red
        exit
    }
} else {
    Write-Host "✓ No large files detected" -ForegroundColor Green
}
Write-Host ""

# Step 7: Commit
Write-Host "Step 7: Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit - DhanAillytics Financial Management System"
Write-Host "✓ Commit created" -ForegroundColor Green
Write-Host ""

# Step 8: Push to GitHub
Write-Host "Step 8: Ready to push to GitHub" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: This will force push and overwrite the remote repository!" -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Push to GitHub now? (yes/no)"

if ($confirm -eq "yes") {
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push -u origin main --force
    Write-Host ""
    Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your repository is now available at:" -ForegroundColor Cyan
    Write-Host "  https://github.com/AmanGiri24x/hjjjj" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can safely delete .git-backup folder if everything looks good:" -ForegroundColor Yellow
    Write-Host "  Remove-Item .git-backup -Recurse -Force" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "Push cancelled. When ready, run:" -ForegroundColor Yellow
    Write-Host "  git push -u origin main --force" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Share this with your friend:" -ForegroundColor Cyan
Write-Host "  git clone https://github.com/AmanGiri24x/hjjjj.git" -ForegroundColor White
Write-Host "  cd hjjjj" -ForegroundColor White
Write-Host "  # Follow README.md for setup instructions" -ForegroundColor White
Write-Host ""
