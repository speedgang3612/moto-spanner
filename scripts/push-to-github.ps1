param(
  [string]$RepoUrl = "https://github.com/speedgang3612/moto-spanner.git",
  [string]$Branch = "main",
  [string]$Message = ""
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$PublishDir = Join-Path $Root ".github-publish"

Remove-Item Env:GIT_DIR -ErrorAction SilentlyContinue
Remove-Item Env:GIT_WORK_TREE -ErrorAction SilentlyContinue
$env:GIT_CEILING_DIRECTORIES = Split-Path $Root -Parent

function Invoke-Git {
  param(
    [string[]]$Arguments,
    [string]$WorkingDirectory = $PublishDir
  )

  & git -C $WorkingDirectory @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Git failed: git $($Arguments -join ' ')"
  }
}

function Copy-RequiredItem {
  param([string]$Name)

  $Source = Join-Path $Root $Name
  $Target = Join-Path $PublishDir $Name
  if (-not (Test-Path $Source)) {
    throw "Missing required file or folder: $Name"
  }

  if (Test-Path $Target) {
    Remove-Item -LiteralPath $Target -Recurse -Force
  }

  Copy-Item -LiteralPath $Source -Destination $Target -Recurse -Force
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git is not installed or not available in PATH."
}

$RequiredItems = @(
  "index.html",
  "styles.css",
  "app.js",
  "motorcycle-data.js",
  "assets",
  ".nojekyll",
  ".gitignore",
  "scripts",
  "README.md",
  "BRAND_OPTIONS.md",
  "GITHUB_PAGES.md"
)

if (Test-Path $PublishDir) {
  Remove-Item -LiteralPath $PublishDir -Recurse -Force
}

$Cloned = $false
try {
  & git clone --branch $Branch $RepoUrl $PublishDir
  if ($LASTEXITCODE -eq 0) {
    $Cloned = $true
  }
} catch {
  $Cloned = $false
}

if (-not $Cloned) {
  New-Item -ItemType Directory -Path $PublishDir | Out-Null
  Invoke-Git -Arguments @("init")
  Invoke-Git -Arguments @("branch", "-M", $Branch)
  Invoke-Git -Arguments @("remote", "add", "origin", $RepoUrl)
}

Get-ChildItem -LiteralPath $PublishDir -Force |
  Where-Object { $_.Name -ne ".git" } |
  Remove-Item -Recurse -Force

foreach ($Item in $RequiredItems) {
  Copy-RequiredItem -Name $Item
}

Invoke-Git -Arguments @("config", "user.name", "speedgang3612")
Invoke-Git -Arguments @("config", "user.email", "speedgang3612@users.noreply.github.com")
Invoke-Git -Arguments @("add", ".")

$Changes = & git -C $PublishDir status --porcelain
if (-not $Changes) {
  Write-Host "No changes to push."
  Write-Host "GitHub Pages URL: https://speedgang3612.github.io/moto-spanner/"
  exit 0
}

if (-not $Message) {
  $Message = "Update Moto Spanner MVP $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Invoke-Git -Arguments @("commit", "-m", $Message)
Invoke-Git -Arguments @("push", "-u", "origin", $Branch)

Write-Host ""
Write-Host "Pushed to $RepoUrl"
Write-Host "GitHub Pages URL: https://speedgang3612.github.io/moto-spanner/"
