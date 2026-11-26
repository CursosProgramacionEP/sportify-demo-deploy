param(
    [string]$ClasspathFile,
    [string]$JavadocPath = 'javadoc'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$backendRoot = Join-Path $projectRoot 'backend/sportify-backend'
$sourceRoot = Join-Path $backendRoot 'src/main/java'
if (-not $ClasspathFile) {
    $ClasspathFile = Join-Path $backendRoot 'target/docs-classpath.txt'
}
if (-not (Test-Path -LiteralPath $ClasspathFile)) {
    throw 'Falta el classpath. Desde backend/sportify-backend ejecutar: .\mvnw.cmd dependency:build-classpath "-Dmdep.outputFile=target/docs-classpath.txt"'
}
$dependencyClasspath = (Get-Content -LiteralPath $ClasspathFile -Raw).Trim()
$outputRoot = Join-Path $projectRoot 'docs/javadoc'
$javadocArgs = @(
    '-encoding', 'UTF-8', '-docencoding', 'UTF-8', '-charset', 'UTF-8',
    '-locale', 'es', '-author', '-public', '-notimestamp',
    '-Xdoclint:all', '-Werror',
    '-d', $outputRoot,
    '-classpath', $dependencyClasspath,
    '-sourcepath', $sourceRoot,
    'com.sportify.backend',
    'com.sportify.backend.config',
    'com.sportify.backend.controller',
    'com.sportify.backend.dto',
    'com.sportify.backend.model',
    'com.sportify.backend.service',
    'com.sportify.backend.repository'
)
Push-Location $projectRoot
try {
    & $JavadocPath @javadocArgs
    if ($LASTEXITCODE -ne 0) { throw "Javadoc terminó con código $LASTEXITCODE" }
} finally {
    Pop-Location
}
Write-Output "Documentación generada: $outputRoot/index.html"
