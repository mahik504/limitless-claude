# Limitless Claude 8.1 - Automated Windows Installer
# Usage: irm https://raw.githubusercontent.com/mahik504/limitless-claude/master/install.ps1 | iex

$ErrorActionPreference = "Stop"

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "           LIMITLESS CLAUDE 8.1 - AUTOMATED WINDOWS INSTALLER" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

# 1. Check Node.js
Write-Host "`n[1/5] Checking Node.js runtime..." -ForegroundColor Yellow
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host "[FAIL] Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install Node.js 22 or higher from https://nodejs.org or run:" -ForegroundColor Yellow
    Write-Host "  winget install OpenJS.NodeJS.LTS" -ForegroundColor White
    exit 1
}

$nodeVersion = node -v
$nodeMajor = [int]($nodeVersion -replace 'v', '').Split('.')[0]
if ($nodeMajor -lt 22) {
    Write-Host "[FAIL] Node.js version $nodeVersion detected. Node.js >= 22 is required." -ForegroundColor Red
    Write-Host "Please upgrade Node.js from https://nodejs.org or run: winget install OpenJS.NodeJS.LTS" -ForegroundColor Yellow
    exit 1
}
Write-Host "  -> Node.js version: $nodeVersion (OK)" -ForegroundColor Green

# 2. Check Git
Write-Host "`n[2/5] Checking Git version control..." -ForegroundColor Yellow
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
    Write-Host "[FAIL] Git is not installed." -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com or run: winget install Git.Git" -ForegroundColor Yellow
    exit 1
}
Write-Host "  -> Git is available (OK)" -ForegroundColor Green

# 3. Target Installation Directory
Write-Host "`n[3/5] Setting up Limitless Claude repository..." -ForegroundColor Yellow
$targetDir = "C:\projects\limitless-claude"
if (-not (Test-Path "C:\projects")) {
    $targetDir = Join-Path $env:USERPROFILE "limitless-claude"
}

if (Test-Path (Join-Path $targetDir ".git")) {
    Write-Host "  -> Existing repository found at $targetDir. Pulling latest release..." -ForegroundColor Cyan
    Push-Location $targetDir
    git fetch origin master
    git reset --hard origin/master
    Pop-Location
} else {
    Write-Host "  -> Cloning Limitless Claude into $targetDir..." -ForegroundColor Cyan
    if (-not (Test-Path (Split-Path $targetDir))) {
        New-Item -ItemType Directory -Path (Split-Path $targetDir) -Force | Out-Null
    }
    git clone https://github.com/mahik504/limitless-claude.git $targetDir
}

# 4. Install Dependencies & Global CLI Link
Write-Host "`n[4/5] Installing dependencies and registering 'limitless' global CLI..." -ForegroundColor Yellow
Push-Location $targetDir
try {
    npm install --silent
    npm link
    Write-Host "  -> Global 'limitless' command registered (OK)" -ForegroundColor Green
} finally {
    Pop-Location
}

# 5. Run Self-Healing Initialization Wizard
Write-Host "`n[5/5] Running Zero-Config Initialization Wizard..." -ForegroundColor Yellow
Push-Location $targetDir
try {
    node bin/limitless.js init
} finally {
    Pop-Location
}

Write-Host "`n================================================================================" -ForegroundColor Cyan
Write-Host "  Limitless Claude 8.1 Installation Complete!" -ForegroundColor Green
Write-Host "  Commands available from any terminal:" -ForegroundColor White
Write-Host "    limitless doctor      # System & gateway diagnostics" -ForegroundColor Gray
Write-Host "    limitless verify      # Live HTTP 200 connectivity check" -ForegroundColor Gray
Write-Host "    limitless pin --list  # Task-to-model pinning manager" -ForegroundColor Gray
Write-Host "    limitless launcher    # Start Claude Code with scoped profile" -ForegroundColor Gray
Write-Host "================================================================================" -ForegroundColor Cyan
