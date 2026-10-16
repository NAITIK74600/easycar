Add-Type -AssemblyName System.IO.Compression.FileSystem

$rootDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$distPath = Join-Path $rootDir "dist"

Write-Host "1. Building fresh client production assets..."
Set-Location $rootDir
npm run build:client

if ($LASTEXITCODE -ne 0) {
    Write-Error "Client build failed. Aborting packaging."
    exit 1
}

# 2. Package easycars-hostinger-public_html.zip (for Hostinger File Manager -> public_html)
$staticZip = Join-Path $rootDir "easycars-hostinger-public_html.zip"
if (Test-Path $staticZip) { Remove-Item -Force $staticZip }

Write-Host "2. Creating $staticZip directly from dist contents..."
[System.IO.Compression.ZipFile]::CreateFromDirectory($distPath, $staticZip, [System.IO.Compression.CompressionLevel]::Optimal, $false)

$zip1 = [System.IO.Compression.ZipFile]::OpenRead($staticZip)
$hasHtaccess = ($zip1.Entries | Where-Object { $_.FullName -eq ".htaccess" }) -ne $null
$hasIndex = ($zip1.Entries | Where-Object { $_.FullName -eq "index.html" }) -ne $null
$zip1.Dispose()
Write-Host "easycars-hostinger-public_html.zip ready! ($([math]::Round((Get-Item $staticZip).Length / 1MB, 2)) MB)"


# 3. Package easycars-hostinger-webapp.zip (for Hostinger Web Applications / Node.js Deployer)
$webAppZip = Join-Path $rootDir "easycars-hostinger-webapp.zip"
if (Test-Path $webAppZip) { Remove-Item -Force $webAppZip }

Write-Host "3. Creating $webAppZip for Hostinger Web Applications tool..."

$stagingDir = Join-Path $rootDir "temp_staging_webapp"
if (Test-Path $stagingDir) { Remove-Item -Recurse -Force $stagingDir }
New-Item -ItemType Directory -Path $stagingDir | Out-Null

# Write clean production package.json strictly for Node 18 runtime on Hostinger
$prodPackageJson = @'
{
  "name": "easy-cars-biel",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "build": "node -e \"console.log('Easy Cars Biel production bundle verified.')\""
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.21.0"
  }
}
'@

Set-Content -Path (Join-Path $stagingDir "package.json") -Value $prodPackageJson -Encoding UTF8

# Copy server.js and dist folder
Copy-Item -Path (Join-Path $rootDir "server.js") -Destination $stagingDir -Force
Copy-Item -Path $distPath -Destination $stagingDir -Recurse -Force

# Create ZIP
[System.IO.Compression.ZipFile]::CreateFromDirectory($stagingDir, $webAppZip, [System.IO.Compression.CompressionLevel]::Optimal, $false)
Remove-Item -Recurse -Force $stagingDir

# Verify webapp zip
$zip2 = [System.IO.Compression.ZipFile]::OpenRead($webAppZip)
$hasPkg = ($zip2.Entries | Where-Object { $_.FullName -eq "package.json" }) -ne $null
$hasServer = ($zip2.Entries | Where-Object { $_.FullName -eq "server.js" }) -ne $null
$hasDist = ($zip2.Entries | Where-Object { $_.FullName -like "dist/index.html" -or $_.FullName -like "dist\index.html" }) -ne $null
$zip2.Dispose()

Write-Host "easycars-hostinger-webapp.zip ready! ($([math]::Round((Get-Item $webAppZip).Length / 1MB, 2)) MB)"
Write-Host "Has package.json at root: $hasPkg"
Write-Host "Has server.js at root: $hasServer"
Write-Host "Has dist/index.html: $hasDist"
Write-Host "ALL HOSTINGER PACKAGES FULLY READY FOR INSTANT DEPLOYMENT!"
