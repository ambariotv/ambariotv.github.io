@echo off
setlocal EnableExtensions
chcp 65001 >nul
title TV de Tubo - Exportar para o site

rem ======================================================================
rem  TV de Tubo - Exportar para o site
rem
rem  Arraste para cima deste arquivo o MKV que o EternalDub gerou no
rem  padrao de videoclipe (faixa 1 = musica do disco, faixa 2 = som da fita).
rem  Numa pasta "para_o_site" ao lado do MKV saem:
rem    NOME.mp4        imagem + audio do disco (H.264 + AAC, toca em qualquer navegador)
rem    NOME-fita.m4a   som original da fita (AAC), na mesma linha do tempo
rem    NOME.jpg        capa (um quadro do video)
rem    NOME-info.txt   duracao e os proximos passos
rem  Precisa do FFmpeg: o mesmo do EternalDub (no PATH, ao lado deste .bat
rem  ou instalado com: winget install Gyan.FFmpeg).
rem ======================================================================

set "FFMPEG="
set "FFPROBE="
call :acharffmpeg
if not defined FFMPEG goto :semffmpeg

set "ENTRADA=%~1"
if not "%ENTRADA%"=="" goto :temarquivo
echo Arraste o arquivo MKV para cima deste .bat, ou cole o caminho aqui.
set /p "ENTRADA=Arquivo: "
:temarquivo
if not defined ENTRADA goto :semarquivo
set "ENTRADA=%ENTRADA:"=%"
if exist "%ENTRADA%" goto :existe
:semarquivo
echo.
echo Nao encontrei o arquivo: "%ENTRADA%"
goto :fim
:existe

for %%F in ("%ENTRADA%") do set "PASTA=%%~dpF"
for %%F in ("%ENTRADA%") do set "NOME=%%~nF"
set "NOME=%NOME: =-%"
set "SAIDA=%PASTA%para_o_site"
if not exist "%SAIDA%" mkdir "%SAIDA%"

echo.
echo ===== TV de Tubo - exportar para o site =====
echo Arquivo: "%ENTRADA%"
echo.
echo Nome dos arquivos novos (sem espacos e sem acentos, ex.: metro-olhar-1985)
set "NOVO="
set /p "NOVO=[Enter = %NOME%]: "
if not "%NOVO%"=="" set "NOME=%NOVO: =-%"

echo.
echo Faixas de audio deste arquivo (numero: formato, canais, nome, idioma):
"%FFPROBE%" -v error -select_streams a -show_entries stream=codec_name,channels:stream_tags=title,language -of csv=p=0 "%ENTRADA%" | findstr /n "^"
set /a N=0
for /f "usebackq delims=" %%L in (`""%FFPROBE%" -v error -select_streams a -show_entries stream=index -of csv=p=0 "%ENTRADA%""`) do set /a N+=1
if %N% EQU 0 goto :semaudio

set "PRI=1"
set "FITA="
if %N% GEQ 2 set "FITA=2"
echo.
echo O EternalDub grava videoclipes assim: 1 = musica do disco, 2 = som original da fita.
set "R="
set /p "R=Numero da faixa com o audio do DISCO [Enter = %PRI%]: "
if not "%R%"=="" set "PRI=%R%"
set "R="
if defined FITA set /p "R=Numero da faixa com o SOM DA FITA [Enter = %FITA%, N = nenhuma]: "
if not defined FITA set /p "R=Numero da faixa com o SOM DA FITA [Enter = nenhuma]: "
if /i "%R%"=="N" set "FITA="
if /i not "%R%"=="N" if not "%R%"=="" set "FITA=%R%"

echo.
set "ENTR=S"
set /p "ENTR=O video e entrelacado, como sai da captura da fita? [S/n]: "
set "AR=4:3"
set /p "AR=Formato da imagem [Enter = 4:3, ou digite 16:9]: "
set "FILTRO="
if /i not "%ENTR%"=="n" set "FILTRO=bwdif=mode=send_field:deint=all,"
set "ESCALA=scale=trunc(ih*4/3/2)*2:ih:flags=lanczos,setsar=1"
if "%AR%"=="16:9" set "ESCALA=scale=trunc(ih*16/9/2)*2:ih:flags=lanczos,setsar=1"
set "FILTRO=%FILTRO%%ESCALA%"
set /a PRI0=PRI-1
if defined FITA set /a FITA0=FITA-1

set "DUR=0"
for /f "usebackq delims=" %%D in (`""%FFPROBE%" -v error -show_entries format=duration -of csv=p=0 "%ENTRADA%""`) do set "DUR=%%D"
for /f "tokens=1 delims=." %%a in ("%DUR%") do set "DURS=%%a"
if "%DURS%"=="" set "DURS=0"
set /a POS=DURS/3
set /a MIN=DURS/60
set /a SEG=DURS%%60
if %SEG% LSS 10 set "SEG=0%SEG%"

echo.
echo [1/3] Imagem + audio do disco: %NOME%.mp4  (pode levar alguns minutos)
"%FFMPEG%" -hide_banner -loglevel error -stats -y -i "%ENTRADA%" -map 0:v:0 -map 0:a:%PRI0% -vf "%FILTRO%" -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -af "aresample=async=1:first_pts=0" -c:a aac -b:a 256k -movflags +faststart -map_metadata -1 -map_chapters -1 "%SAIDA%\%NOME%.mp4"
if errorlevel 1 goto :erro

if not defined FITA goto :capa
echo [2/3] Som original da fita: %NOME%-fita.m4a
"%FFMPEG%" -hide_banner -loglevel error -y -i "%ENTRADA%" -map 0:a:%FITA0% -vn -af "aresample=async=1:first_pts=0" -c:a aac -b:a 160k -movflags +faststart -map_metadata -1 "%SAIDA%\%NOME%-fita.m4a"
if errorlevel 1 goto :erro

:capa
echo [3/3] Capa: %NOME%.jpg
"%FFMPEG%" -hide_banner -loglevel error -y -ss %POS% -i "%ENTRADA%" -frames:v 1 -vf "%FILTRO%" -q:v 3 "%SAIDA%\%NOME%.jpg"

set "INFO=%SAIDA%\%NOME%-info.txt"
> "%INFO%" echo TV de Tubo - %NOME%
>> "%INFO%" echo Duracao: %MIN%:%SEG%
>> "%INFO%" echo Arquivos: %NOME%.mp4 / %NOME%.jpg
if defined FITA >> "%INFO%" echo Som da fita: %NOME%-fita.m4a
>> "%INFO%" echo.
>> "%INFO%" echo Proximos passos:
>> "%INFO%" echo 1. archive.org/upload - envie o MP4, o JPG, o M4A e, se quiser, o MKV original como matriz.
>> "%INFO%" echo    Identificador sugerido: tvdetubo-%NOME%
>> "%INFO%" echo    Assunto/tags: tvdetubo; videoclipe; VHS. Tipo de midia: Movies.
>> "%INFO%" echo 2. No site, abra a area do curador: endereco do site + #admin
>> "%INFO%" echo    Cole o identificador, clique em Importar arquivos, complete e gere o bloco.
>> "%INFO%" echo 3. Cole o bloco em data/acervo.js e envie o arquivo para o GitHub.

echo.
echo Pronto! Os arquivos estao em:
echo   %SAIDA%
echo Duracao: %MIN%:%SEG%   (os proximos passos estao em %NOME%-info.txt)
start "" explorer "%SAIDA%"
goto :fim

:erro
echo.
echo Algo deu errado no FFmpeg (veja a mensagem acima). Nada foi apagado.
goto :fim

:semaudio
echo   Nenhuma faixa de audio encontrada neste arquivo.
goto :fim

:semffmpeg
echo Nao encontrei o FFmpeg.
echo Instale com:  winget install Gyan.FFmpeg
echo ou coloque ffmpeg.exe e ffprobe.exe ao lado deste arquivo .bat.
goto :fim

:acharffmpeg
for %%X in (ffmpeg.exe) do if not "%%~$PATH:X"=="" set "FFMPEG=%%~$PATH:X"
for %%X in (ffprobe.exe) do if not "%%~$PATH:X"=="" set "FFPROBE=%%~$PATH:X"
if not defined FFMPEG if exist "%~dp0ffmpeg.exe" set "FFMPEG=%~dp0ffmpeg.exe"
if not defined FFPROBE if exist "%~dp0ffprobe.exe" set "FFPROBE=%~dp0ffprobe.exe"
if not defined FFMPEG if exist "%~dp0ffmpeg\bin\ffmpeg.exe" set "FFMPEG=%~dp0ffmpeg\bin\ffmpeg.exe"
if not defined FFPROBE if exist "%~dp0ffmpeg\bin\ffprobe.exe" set "FFPROBE=%~dp0ffmpeg\bin\ffprobe.exe"
if defined FFMPEG goto :achou
for /d %%P in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg*") do for /d %%Q in ("%%P\ffmpeg-*") do if exist "%%Q\bin\ffmpeg.exe" set "FFMPEG=%%Q\bin\ffmpeg.exe"
for /d %%P in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg*") do for /d %%Q in ("%%P\ffmpeg-*") do if exist "%%Q\bin\ffprobe.exe" set "FFPROBE=%%Q\bin\ffprobe.exe"
:achou
if defined FFMPEG if not defined FFPROBE set "FFMPEG="
exit /b

:fim
echo.
pause
endlocal
