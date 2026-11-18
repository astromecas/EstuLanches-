# Validação pós-implantação do EstuLanches (Node.js) para Windows PowerShell
# Uso: .\scripts\validar.ps1

$ErrorActionPreference = "Continue"
$Port = if ($env:APP_PORT) { $env:APP_PORT } else { "8000" }
$Url = "http://localhost:$Port"
$ok = 0
$falha = 0

function Check-Step {
    param(
        [string]$Nome,
        [scriptblock]$Command
    )
    try {
        $result = & $Command
        if ($LASTEXITCODE -eq 0 -or $result -eq $true) {
            Write-Host "[OK]    $Nome" -ForegroundColor Green
            $global:ok++
        } else {
            Write-Host "[FALHA] $Nome" -ForegroundColor Red
            $global:falha++
        }
    } catch {
        Write-Host "[FALHA] $Nome" -ForegroundColor Red
        $global:falha++
    }
}

Write-Host "== Serviços ==" -ForegroundColor Cyan
docker compose ps

Check-Step "db saudável" { (docker compose ps db --format "{{.Status}}") -match "healthy" }
Check-Step "app saudável" { (docker compose ps app --format "{{.Status}}") -match "healthy" }
Check-Step "porta 5432 NÃO exposta no host" { -not (docker compose port db 5432) }

Write-Host "`n== Logs (erros críticos) ==" -ForegroundColor Cyan
Check-Step "logs sem ERROR/FATAL/Traceback" {
    $logs = docker compose logs --no-color 2>&1
    -not ($logs | Select-String -Pattern "ERROR|FATAL|CRITICAL|Traceback")
}
Check-Step "banco pronto para conexões" {
    $dbLogs = docker compose logs db 2>&1
    ($dbLogs | Select-String -Pattern "ready to accept connections") -ne $null
}
Check-Step "app iniciou" {
    $appLogs = docker compose logs app 2>&1
    ($appLogs | Select-String -Pattern "EstuLanches rodando") -ne $null
}

Write-Host "`n== Testes Automatizados (Jest) ==" -ForegroundColor Cyan
Check-Step "testes Jest (unitários e integração)" { docker compose exec -T app npm test }

Write-Host "`n== Smoke test no banco real (Postgres) ==" -ForegroundColor Cyan
Check-Step "GET /health" {
    $res = Invoke-RestMethod -Uri "$Url/health" -Method Get
    $res.status -eq "ok"
}
Check-Step "POST /cardapio" {
    $body = @{ nome = "smoke-$(Get-Random)"; preco = 1 } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$Url/cardapio" -Method Post -Body $body -ContentType "application/json"
    $res.id -ne $null
}
Check-Step "GET /cardapio" {
    $res = Invoke-RestMethod -Uri "$Url/cardapio" -Method Get
    $res.Count -gt 0
}

Write-Host "`nResumo: $ok OK, $falha falha(s)" -ForegroundColor Yellow
if ($falha -gt 0) { exit 1 } else { exit 0 }
