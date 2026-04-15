# ============================================================
# SpeakUp — GitHub Repo Creator + Push Script
# Run this ONCE from inside the speakup folder
# Requirements: Git installed, GitHub CLI (gh) installed & authenticated
# ============================================================

param(
    [string]$RepoName = "speakup",
    [string]$Description = "12-week speaking confidence PWA for children",
    [ValidateSet("public","private")]
    [string]$Visibility = "private"
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host "`n>> $msg" -ForegroundColor Cyan
}

function Write-OK($msg) {
    Write-Host "   OK: $msg" -ForegroundColor Green
}

function Write-Fail($msg) {
    Write-Host "   FAIL: $msg" -ForegroundColor Red
    exit 1
}

# ─── 0. Pre-flight checks ─────────────────────────────────────────────────────

Write-Step "Checking prerequisites..."

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Fail "Git not found. Install from https://git-scm.com"
}
Write-OK "Git found"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Fail "GitHub CLI not found. Install from https://cli.github.com then run: gh auth login"
}
Write-OK "GitHub CLI found"

# Check gh is authenticated
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Fail "GitHub CLI not authenticated. Run: gh auth login"
}
Write-OK "GitHub CLI authenticated"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Fail "Node.js not found. Install from https://nodejs.org (LTS version)"
}
Write-OK "Node.js found: $(node --version)"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Fail "npm not found"
}
Write-OK "npm found: $(npm --version)"

# ─── 1. Verify we are in the right folder ─────────────────────────────────────

Write-Step "Checking project structure..."

$requiredFiles = @(
    "package.json",
    "tsconfig.json",
    "next.config.js",
    "src\app\page.tsx",
    "src\app\session\page.tsx",
    "src\app\progress\page.tsx",
    "src\app\parent\page.tsx",
    "src\app\settings\page.tsx",
    "src\lib\storage.ts",
    "src\lib\unlock.ts",
    "src\lib\streak.ts",
    "src\lib\prompts.ts",
    "src\lib\progress.ts",
    "src\data\programWeeks.ts",
    "src\types\index.ts"
)

$missing = @()
foreach ($f in $requiredFiles) {
    if (-not (Test-Path $f)) { $missing += $f }
}

if ($missing.Count -gt 0) {
    Write-Host "   Missing files:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "     - $_" -ForegroundColor Red }
    Write-Fail "Run this script from inside the speakup project root"
}
Write-OK "All required files present"

# ─── 2. Install dependencies ──────────────────────────────────────────────────

Write-Step "Installing dependencies..."
npm install
if ($LASTEXITCODE -ne 0) { Write-Fail "npm install failed" }
Write-OK "Dependencies installed"

# ─── 3. Type check ────────────────────────────────────────────────────────────

Write-Step "Running TypeScript check..."
npm run type-check
if ($LASTEXITCODE -ne 0) { Write-Fail "TypeScript errors found. Fix before pushing." }
Write-OK "TypeScript clean"

# ─── 4. Build check ───────────────────────────────────────────────────────────

Write-Step "Running production build check..."
npm run build
if ($LASTEXITCODE -ne 0) { Write-Fail "Build failed. Fix errors before pushing." }
Write-OK "Build succeeded"

# ─── 5. Git init ──────────────────────────────────────────────────────────────

Write-Step "Initialising Git..."

if (-not (Test-Path ".git")) {
    git init
    Write-OK "Git initialised"
} else {
    Write-OK "Git already initialised"
}

# Set default branch to main
git checkout -b main 2>$null
if ($LASTEXITCODE -ne 0) {
    # branch may already exist
    git checkout main 2>$null
}

# ─── 6. Initial commit ────────────────────────────────────────────────────────

Write-Step "Creating initial commit..."

git add .
git commit -m "feat: SpeakUp Phase 1 — 12-week speaking PWA

- 12 weeks x 10 prompts (120 unique topics)
- Real consecutive-day streak logic
- Sequential week unlock (5 sessions per week)
- Deterministic prompt rotation (no weekly repeats)
- Countdown timer with SVG progress ring
- MediaRecorder voice capture with fallback
- Confidence rating (1-5)
- Parent dashboard with PIN gate + JSON export
- localStorage — no backend required
- PWA manifest — installable on mobile"

if ($LASTEXITCODE -ne 0) { Write-Fail "Git commit failed" }
Write-OK "Initial commit created"

# ─── 7. Create GitHub repo ────────────────────────────────────────────────────

Write-Step "Creating GitHub repository: $RepoName ($Visibility)..."

# Check if repo already exists
$existingRepo = gh repo view $RepoName 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Repo already exists — skipping creation, will push to existing" -ForegroundColor Yellow
} else {
    gh repo create $RepoName --description $Description --$Visibility --source=. --remote=origin
    if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to create GitHub repo" }
    Write-OK "GitHub repo created"
}

# ─── 8. Set remote if not set ─────────────────────────────────────────────────

$remotes = git remote
if (-not ($remotes -contains "origin")) {
    Write-Step "Setting remote origin..."
    $ghUser = gh api user --jq .login
    git remote add origin "https://github.com/$ghUser/$RepoName.git"
    Write-OK "Remote origin set"
}

# ─── 9. Push ──────────────────────────────────────────────────────────────────

Write-Step "Pushing to GitHub..."
git push -u origin main
if ($LASTEXITCODE -ne 0) { Write-Fail "Push failed" }
Write-OK "Pushed to GitHub"

# ─── 10. Done ─────────────────────────────────────────────────────────────────

$ghUser = gh api user --jq .login
$repoUrl = "https://github.com/$ghUser/$RepoName"

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "  DONE" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Repo:    $repoUrl" -ForegroundColor White
Write-Host "  Run app: npm run dev" -ForegroundColor White
Write-Host "  Open:    http://localhost:3000" -ForegroundColor White
Write-Host "============================================================`n" -ForegroundColor Green
