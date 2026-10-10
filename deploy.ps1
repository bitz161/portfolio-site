# Deploys the current local portfolio-site source to swe-2.
# Run from Windows PowerShell inside this directory:
#   .\deploy.ps1
#
# What it does:
#   1. Type-checks locally (aborts if it fails, never ships broken code)
#   2. Packages the source (excluding node_modules/.next/.git) into a tarball
#   3. Copies it to swe-2 and unpacks it NEXT TO the live folder; the live folder is only
#      swapped after the unpack worked, and the previous one is kept as portfolio-site.prev
#   4. Rebuilds the image and recreates ONLY the portfolio container
#   5. Curl-checks the main routes to confirm the new build is actually serving
#
# Why step 4 looks the way it does: this stack runs from several compose files, and
# `docker compose up -d portfolio` without the same -f list and without --no-deps makes
# compose recreate its dependency (mysql) too. That drops the database for about 10 s and
# fails the Debezium task. Keep the -f list in step with /etc/systemd/system/compose-stack.service.

# "Continue", not "Stop": Windows PowerShell 5.1 turns any stderr line from a native command
# (docker compose prints build progress there) into a fatal error under "Stop". Every native
# call below checks its exit code instead.
$ErrorActionPreference = "Continue"
$server = "swe@100.124.72.42"
$tmpTar = "$env:TEMP\portfolio-site-deploy.tar.gz"
$files = "-f docker-compose.yml -f docker-compose.monitoring.yml -f docker-compose.migration.yml -f docker-compose.media.yml -f docker-compose.replication.yml -f docker-compose.proxysql.yml"

function Run-Remote($cmd) {
    ssh $server $cmd
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Remote command failed (exit $LASTEXITCODE): $cmd" -ForegroundColor Red
        exit 1
    }
}

Write-Host "== 1. Type-checking locally ==" -ForegroundColor Cyan
npx next typegen
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "Type check failed, aborting deploy." -ForegroundColor Red
    exit 1
}

Write-Host "== 2. Packaging source ==" -ForegroundColor Cyan
tar --exclude=node_modules --exclude=.next --exclude=.git -czf $tmpTar .
if ($LASTEXITCODE -ne 0) { Write-Host "tar failed" -ForegroundColor Red; exit 1 }

Write-Host "== 3. Copying to swe-2 (unpack beside the live folder, then swap) ==" -ForegroundColor Cyan
scp $tmpTar "${server}:/home/swe/stack/portfolio-site.tar.gz"
if ($LASTEXITCODE -ne 0) { Write-Host "scp failed, nothing changed on the server." -ForegroundColor Red; exit 1 }
Remove-Item $tmpTar
Run-Remote "cd /home/swe/stack && rm -rf portfolio-site.new && mkdir portfolio-site.new && tar -xzf portfolio-site.tar.gz -C portfolio-site.new && rm portfolio-site.tar.gz && test -f portfolio-site.new/package.json && rm -rf portfolio-site.prev && mv portfolio-site portfolio-site.prev && mv portfolio-site.new portfolio-site"

Write-Host "== 4. Building and recreating only the portfolio container ==" -ForegroundColor Cyan
Run-Remote "cd /home/swe/stack && docker compose $files up -d --no-deps --build portfolio"

Write-Host "== 5. Verifying ==" -ForegroundColor Cyan
Start-Sleep -Seconds 3
ssh $server "curl -s -o /dev/null -w 'home: %{http_code}\n' http://127.0.0.1:3000/"
ssh $server "curl -s -o /dev/null -w 'projects: %{http_code}\n' http://127.0.0.1:3000/projects"
ssh $server "curl -s -o /dev/null -w 'about: %{http_code}\n' http://127.0.0.1:3000/about"
ssh $server "curl -s -o /dev/null -w 'blog: %{http_code}\n' http://127.0.0.1:3000/blog"
ssh $server "docker ps --format '{{.Names}} {{.Status}}' | grep -E '^(mysql|portfolio) '"

Write-Host "== Done. Live at https://swe-2.tail174d56.ts.net ==" -ForegroundColor Green
Write-Host "Check that 'mysql' above shows an uptime that did NOT just reset." -ForegroundColor Yellow
