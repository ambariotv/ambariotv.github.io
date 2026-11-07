@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Ambario - Exportar para o site

rem ======================================================================
rem  Ambario - Exportar para o site
rem
rem  Arraste para cima deste arquivo o MKV que o EternalDub gerou no
rem  padrao de videoclipe (faixa 1 = musica do disco, faixa 2 = som da fita).
rem  Numa pasta "para_o_site" ao lado do MKV saem:
rem    NOME.mp4        imagem + audio do disco (H.264 + AAC, toca em qualquer navegador)
rem    NOME-fita.m4a   som original da fita (AAC), na mesma linha do tempo
rem  O .bat confere sozinho se a imagem e entrelacada e se tem bordas pretas,
rem  e sugere o que fazer (voce so confirma com Enter).
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
echo ===== Ambario - exportar para o site =====
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

set "DUR=0"
for /f "usebackq delims=" %%D in (`""%FFPROBE%" -v error -show_entries format=duration -of csv=p=0 "%ENTRADA%""`) do set "DUR=%%D"
for /f "tokens=1 delims=." %%a in ("%DUR%") do set "DURS=%%a"
if "%DURS%"=="" set "DURS=0"
set /a POS=DURS/3
set /a MIN=DURS/60
set /a SEG=DURS%%60
if %SEG% LSS 10 set "SEG=0%SEG%"

rem ---- imagem: entrelacamento, bordas pretas e proporcao (o .bat sugere; Enter confirma) ----
set "ORDEM="
for /f "usebackq delims=" %%O in (`""%FFPROBE%" -v error -select_streams v:0 -show_entries stream=field_order -of csv=p=0 "%ENTRADA%""`) do set "ORDEM=%%O"
if "%ORDEM%"=="" set "ORDEM=desconhecido"
set "LARG=0"
set "ALT=0"
for /f "usebackq tokens=1,2 delims=x" %%A in (`""%FFPROBE%" -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "%ENTRADA%""`) do (set "LARG=%%A" & set "ALT=%%B")

set "ENTR=S"
set "DICA=entrelacada, como sai da captura da fita"
if /i "%ORDEM%"=="progressive" set "ENTR=N"
if %ALT% GTR 576 set "ENTR=N"
if /i "%ENTR%"=="N" set "DICA=progressiva (copia digital, DVD, internet)"
echo.
echo Imagem: %LARG%x%ALT%, parece %DICA%. [field_order: %ORDEM%]
set "R="
set /p "R=Tirar o entrelacamento? [Enter = %ENTR%, ou digite S ou N]: "
if /i "%R%"=="S" set "ENTR=S"
if /i "%R%"=="N" set "ENTR=N"

echo.
echo Procurando bordas pretas (leva alguns segundos)...
set "CORTE="
set "LINHA="
set /a INI=DURS/4
set "TMPCD=%TEMP%\ambario-bordas-%RANDOM%.txt"
"%FFMPEG%" -hide_banner -nostats -nostdin -ss %INI% -i "%ENTRADA%" -t 40 -map 0:v:0 -an -sn -vf cropdetect=24:2:0 -f null - 2> "%TMPCD%"
for /f "usebackq tokens=*" %%L in (`findstr /c:"crop=" "%TMPCD%"`) do set "LINHA=%%L"
del "%TMPCD%" >nul 2>&1
if not defined LINHA goto :semcorte
rem a linha termina em "crop=L:A:X:Y" e e o unico "=" dela (a palavra cropdetect aparece antes, por isso nao da para cortar em "crop")
for /f "tokens=2 delims==" %%C in ("%LINHA%") do set "CORTE=%%C"
set "CW=0"
set "CH=0"
for /f "tokens=1,2 delims=:" %%a in ("%CORTE%") do (set "CW=%%a" & set "CH=%%b")
rem sem borda (ou deteccao estranha, menos da metade da imagem): nao corta
if "%CW%x%CH%"=="%LARG%x%ALT%" set "CORTE="
set /a MEIAL=LARG/2
set /a MEIAA=ALT/2
if %CW% LSS %MEIAL% set "CORTE="
if %CH% LSS %MEIAA% set "CORTE="
if not defined CORTE goto :semcorte
echo A parte com imagem parece ser %CW%x%CH% (o arquivo tem %LARG%x%ALT%).
set "R="
set /p "R=Cortar as bordas pretas? [Enter = S, ou N]: "
if /i "%R%"=="N" set "CORTE="
goto :proporcao
:semcorte
echo Nenhuma borda preta para cortar.
:proporcao

echo.
echo Proporcao final da imagem:
echo   Enter = manter como esta (so acerta pixels nao quadrados, ex.: 720x480 vira 640x480)
echo   4     = forcar 4:3 (use quando uma imagem 4:3 foi esticada para 16:9)
echo   16    = forcar 16:9
set "AR="
set /p "AR=Escolha [Enter, 4 ou 16]: "
set "FILTRO="
if /i "%ENTR%"=="S" set "FILTRO=bwdif=mode=send_field:deint=all,"
if defined CORTE set "FILTRO=%FILTRO%crop=%CORTE%,"
set "ESCALA=scale=trunc(iw*sar/2)*2:trunc(ih/2)*2:flags=lanczos,setsar=1"
if "%AR%"=="4" set "ESCALA=scale=trunc(ih*4/3/2)*2:trunc(ih/2)*2:flags=lanczos,setsar=1"
if "%AR%"=="4:3" set "ESCALA=scale=trunc(ih*4/3/2)*2:trunc(ih/2)*2:flags=lanczos,setsar=1"
if "%AR%"=="16" set "ESCALA=scale=trunc(ih*16/9/2)*2:trunc(ih/2)*2:flags=lanczos,setsar=1"
if "%AR%"=="16:9" set "ESCALA=scale=trunc(ih*16/9/2)*2:trunc(ih/2)*2:flags=lanczos,setsar=1"
set "FILTRO=%FILTRO%%ESCALA%"
set /a PRI0=PRI-1
if defined FITA set /a FITA0=FITA-1


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

set "TAM="
for /f "usebackq delims=" %%T in (`""%FFPROBE%" -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "%SAIDA%\%NOME%.mp4""`) do set "TAM=%%T"
set "INFO=%SAIDA%\%NOME%-info.txt"
> "%INFO%" echo Ambario - %NOME%
>> "%INFO%" echo Duracao: %MIN%:%SEG%   Imagem final: %TAM%
>> "%INFO%" echo Arquivos: %NOME%.mp4 / %NOME%.jpg
if defined FITA >> "%INFO%" echo Som da fita: %NOME%-fita.m4a
>> "%INFO%" echo.
>> "%INFO%" echo Proximos passos:
>> "%INFO%" echo 1. archive.org/upload - envie o MP4, o JPG, o M4A e, se quiser, o MKV original como matriz.
>> "%INFO%" echo    Identificador sugerido: ambario-%NOME%
>> "%INFO%" echo    Assunto/tags: ambario; videoclipe; VHS. Tipo de midia: Movies.
>> "%INFO%" echo 2. No site, abra a area do curador: endereco do site + #admin
>> "%INFO%" echo    Abra o video (ou + Novo video), cole o identificador em "Item do Internet Archive"
>> "%INFO%" echo    e clique em Importar arquivos. Confira e clique em Salvar e publicar.

echo.
echo Pronto! Os arquivos estao em:
echo   %SAIDA%
echo Duracao: %MIN%:%SEG%   Imagem final: %TAM%   (os proximos passos estao em %NOME%-info.txt)
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
