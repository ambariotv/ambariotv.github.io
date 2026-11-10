@echo off
rem Ambario - abre o Exportador mostrando a janela preta do PowerShell (para ver mensagens de erro).
set "AMB_PASTA=%~dp0"
set "AMB_ARQ=%~1"
powershell.exe -NoProfile -NoExit -ExecutionPolicy Bypass -STA -Command "$s=[IO.File]::ReadAllText($env:AMB_PASTA+'Exportador_Ambario.ps1',[Text.Encoding]::UTF8); & ([scriptblock]::Create($s)) $env:AMB_ARQ"
