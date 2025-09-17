# Copiar assets estáticos para a pasta public
# Uso: abra PowerShell na raiz do projeto e execute:
# .\scripts\copy-assets.ps1

$source = Join-Path -Path $PSScriptRoot -ChildPath "..\assets\background.jpg"
$destDir = Join-Path -Path $PSScriptRoot -ChildPath "..\public\assets"
$dest = Join-Path -Path $destDir -ChildPath "background.jpg"

if (-Not (Test-Path $source)) {
    Write-Error "Arquivo de origem não encontrado: $source"
    Write-Host "Coloque o arquivo background.jpg em src/assets/ ou copie manualmente para public/assets/."
    exit 1
}

if (-Not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

Copy-Item -Path $source -Destination $dest -Force
Write-Host "Arquivo copiado para $dest"