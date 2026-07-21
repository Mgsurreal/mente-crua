$ErrorActionPreference = "Stop"

$project = Split-Path -Parent $PSScriptRoot
$port = 5501
$url = "http://127.0.0.1:$port/"

function Find-Node {
    $command = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    $common = @(
        "C:\Program Files\nodejs\node.exe",
        "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
    )

    foreach ($candidate in $common) {
        if (Test-Path -LiteralPath $candidate) {
            return $candidate
        }
    }

    $runtimeRoot = Join-Path $env:LOCALAPPDATA "OpenAI\Codex\runtimes\cua_node"

    if (Test-Path -LiteralPath $runtimeRoot) {
        $runtime = Get-ChildItem `
            -LiteralPath $runtimeRoot `
            -Filter node.exe `
            -Recurse `
            -ErrorAction SilentlyContinue |
            Select-Object -First 1 -ExpandProperty FullName

        if ($runtime) {
            return $runtime
        }
    }

    throw "Node.js nao foi encontrado. Instale a versao LTS e tente novamente."
}

# Encerra qualquer servidor antigo usando a porta 5501
$oldConnections = Get-NetTCPConnection `
    -LocalPort $port `
    -State Listen `
    -ErrorAction SilentlyContinue

foreach ($connection in $oldConnections) {
    Stop-Process `
        -Id $connection.OwningProcess `
        -Force `
        -ErrorAction SilentlyContinue
}

Start-Sleep -Milliseconds 400

$node = Find-Node
$server = Join-Path $project "scripts\servidor-mente-crua.js"

if (-not (Test-Path -LiteralPath $server)) {
    throw "O servidor do Mente Crua nao foi encontrado em: $server"
}

Start-Process `
    -FilePath $node `
    -ArgumentList @("`"$server`"", $port) `
    -WorkingDirectory $project `
    -WindowStyle Hidden

for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 250

    $running = Get-NetTCPConnection `
        -LocalPort $port `
        -State Listen `
        -ErrorAction SilentlyContinue

    if ($running) {
        break
    }
}

Start-Process $url