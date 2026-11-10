@echo off
rem Ambario - abre o Exportador com janela (Exportador_Ambario.ps1).
rem Dois cliques aqui, ou arraste o MKV para cima deste arquivo.
rem O script e lido como UTF-8 de proposito: assim os acentos funcionam mesmo se o arquivo perder a marca BOM no download.
set "AMB_PASTA=%~dp0"
set "AMB_ARQ=%~1"
start "" powershell.exe -NoProfile -ExecutionPolicy Bypass -STA -WindowStyle Hidden -Command "$s=[IO.File]::ReadAllText($env:AMB_PASTA+'Exportador_Ambario.ps1',[Text.Encoding]::UTF8); & ([scriptblock]::Create($s)) $env:AMB_ARQ"
