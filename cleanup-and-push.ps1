# DhanAillytics - Git Cleanup and Push Script
# This script removes large files from git history and prepares the repo for GitHub

Write-Host "=== DhanAillytics Git Cleanup Script ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Backup current branch
Write-Host "Step 1: Creating backup branch..." -ForegroundColor Yellow
git branch backup-before-cleanup
Write-Host "✓ Backup branch 'backup-before-cleanup' created" -ForegroundColor Green
Write-Host ""

# Step 2: Remove large files from git history using filter-branch
Write-Host "Step 2: Removing large files from git history..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray

# List of paths to remove from history
$pathsToRemove = @(
    "frontend/.next",
    "frontend/node_modules",
    "backend/node_modules",
    "backend-nestjs/node_modules",
    "python-services/venv",
    "frontend - Copy"
)

foreach ($path in $pathsToRemove) {
    Write-Host "  Removing: $path" -ForegroundColor Gray
    git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch $path" --prune-empty --tag-name-filter cat -- --all 2>$null
}

Write-Host "✓ Large files removed from history" -ForegroundColor Green
Write-Host ""

# Step 3: Clean up refs and garbage collect
Write-Host "Step 3: Cleaning up repository..." -ForegroundColor Yellow
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
Write-Host "✓ Repository cleaned" -ForegroundColor Green
Write-Host ""

# Step 4: Verify repository size
Write-Host "Step 4: Checking repository size..." -ForegroundColor Yellow
$repoSize = (Get-ChildItem .git -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  Repository size: $([math]::Round($repoSize, 2)) MB" -ForegroundColor Cyan
Write-Host ""

# Step 5: Check for large files
Write-Host "Step 5: Verifying no large files in history..." -ForegroundColor Yellow
$largeFiles = git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | Where-Object { $_ -match '^blob' } | ForEach-Object { 
    $parts = $_ -split ' '
    if ([int]$parts[2] -gt 100000000) { 
        [PSCustomObject]@{
            File = $parts[3]
            SizeMB = [math]::Round([int]$parts[2]/1MB, 2)
        }
    } 
}

if ($largeFiles) {
    Write-Host "⚠ Warning: Large files still found:" -ForegroundColor Red
    $largeFiles | Format-Table -AutoSize
    Write-Host ""
    Write-Host "You may need to run additional cleanup. Consider using BFG Repo-Cleaner:" -ForegroundColor Yellow
    Write-Host "  https://rtyley.github.io/bfg-repo-cleaner/" -ForegroundColor Cyan
} else {
    Write-Host "✓ No files over 100MB found in history" -ForegroundColor Green
}
Write-Host ""

# Step 6: Push to GitHub
Write-Host "Step 6: Ready to push to GitHub" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: This will force push and overwrite the remote repository!" -ForegroundColor Red
Write-Host "Make sure you have a backup if needed." -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Do you want to push to GitHub now? (yes/no)"

if ($confirm -eq "yes") {
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main --force
    Write-Host ""
    Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your repository is now available at:" -ForegroundColor Cyan
    Write-Host "  https://github.com/AmanGiri24x/hjjjj" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Push cancelled. When ready, run:" -ForegroundColor Yellow
    Write-Host "  git push origin main --force" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== Cleanup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps for your friend:" -ForegroundColor Cyan
Write-Host "1. Clone the repository: git clone https://github.com/AmanGiri24x/hjjjj.git" -ForegroundColor White
Write-Host "2. Follow the setup instructions in README.md" -ForegroundColor White
Write-Host ""
