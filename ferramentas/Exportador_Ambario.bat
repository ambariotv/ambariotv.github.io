@echo off
rem Ambario - abre o Exportador com janela (Exportador_Ambario.ps1).
rem Dois cliques aqui, ou arraste o MKV para cima deste arquivo.
start "" powershell.exe -NoProfile -ExecutionPolicy Bypass -STA -WindowStyle Hidden -File "%~dp0Exportador_Ambario.ps1" %1
