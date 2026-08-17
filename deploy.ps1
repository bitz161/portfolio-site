# Deploys the current local portfolio-site source to swe-2.
# Run from Windows PowerShell inside this directory:
#   .\deploy.ps1
#
# What it does:
#   1. Type-checks locally (aborts if it fails, never ships broken code)
#   2. Packages the source (excluding node_modules/.next/.git) into a tarball
#   3. Copies it to swe-2 and replaces /home/swe/stack/portfolio-site
#   4. Rebuilds the Docker image and recreates the running container
#   5. Curl-checks the main routes to confirm the new build is actually serving

$ErrorActionPreference = "Stop"
$server = "swe@100.124.72.42"
$tmpTar = "$env:TEMP\portfolio-site-deploy.tar.gz"

Write-Host "== 1. Type-checking locally ==" -ForegroundColor Cyan
npx next typegen
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "Type check failed, aborting deploy." -ForegroundColor Red
    exit 1
}

Write-Host "== 2. Packaging source ==" -ForegroundColor Cyan
tar --exclude=node_modules --exclude=.next --exclude=.git -czf $tmpTar .

Write-Host "== 3. Copying to swe-2 ==" -ForegroundColor Cyan
ssh $server "rm -rf /home/swe/stack/portfolio-site/* /home/swe/stack/portfolio-site/.[!.]*"
scp $tmpTar "${server}:/home/swe/stack/portfolio-site.tar.gz"
ssh $server "tar -xzf /home/swe/stack/portfolio-site.tar.gz -C /home/swe/stack/portfolio-site; rm /home/swe/stack/portfolio-site.tar.gz"
Remove-Item $tmpTar

Write-Host "== 4. Building and restarting the container ==" -ForegroundColor Cyan
ssh $server "cd /home/swe/stack; docker compose build portfolio; docker compose up -d portfolio"

Write-Host "== 5. Verifying ==" -ForegroundColor Cyan
Start-Sleep -Seconds 2
ssh $server "curl -s -o /dev/null -w 'home: %{http_code}\n' http://127.0.0.1:3000/"
ssh $server "curl -s -o /dev/null -w 'projects: %{http_code}\n' http://127.0.0.1:3000/projects"
ssh $server "curl -s -o /dev/null -w 'about: %{http_code}\n' http://127.0.0.1:3000/about"
ssh $server "curl -s -o /dev/null -w 'blog: %{http_code}\n' http://127.0.0.1:3000/blog"

Write-Host "== Done. Live at https://swe-2.tail174d56.ts.net ==" -ForegroundColor Green
