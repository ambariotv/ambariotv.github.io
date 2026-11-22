@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Ambario - Exportar para o site

rem ======================================================================
rem  Ambario - Exportar para o site   (versao 3)
rem
rem  Arraste para cima deste arquivo o MKV que o EternalDub gerou no padrao
rem  de videoclipe (faixa 1 = musica do disco, faixa 2 = som da fita).
rem  Pode arrastar VARIOS MKVs de uma vez: ai ele roda sozinho, aceitando
rem  as sugestoes para cada um.
rem
rem  Primeiro ele ANALISA o arquivo (faixas, entrelacamento, bordas pretas,
rem  se o navegador toca os codecs) e mostra o plano. Um Enter e pronto;
rem  C ajusta qualquer coisa. Nada do original e alterado ou apagado.
rem
rem  Numa pasta "para_o_site\NOME" ao lado do MKV saem so 4 arquivos:
rem    NOME.mkv           o original, integro (atalho de disco: nao gasta espaco)
rem    NOME.mp4           imagem + audio do disco. COPIA SEM PERDA (-c copy),
rem                       so troca o envelope MKV por MP4 (recodifica apenas
rem                       se o navegador nao tocar o codec do original)
rem    NOME-fita.m4a      som original da fita, copia sem perda, na mesma
rem                       linha do tempo
rem    NOME_celular.mp4   versao leve (480p, H.264 + AAC) para celulares:
rem                       tira o entrelacamento, corta bordas pretas
rem
rem  Conferencias automaticas (mostradas na tela, sem criar arquivos): os
rem  pacotes de video e audio do MP4 e do M4A sao comparados (SHA-256) com os
rem  do MKV; duracao de cada arquivo; e o arquivo celular e lido do comeco ao
rem  fim para achar erros. Os arquivos so ganham o nome final quando o FFmpeg
rem  termina sem erro (.part).
rem
rem  Precisa do FFmpeg: o mesmo do EternalDub (no PATH, ao lado deste .bat
rem  ou instalado com: winget install Gyan.FFmpeg) e do PowerShell, que ja
rem  vem no Windows.
rem  Tudo o que esta depois da linha de marcacao no fim do bloco abaixo e o
rem  programa em PowerShell; o Windows nao le essa parte como .bat.
rem ======================================================================

set "AMB_PASTA=%~dp0"
set "AMB_BAT=%~f0"
set "AMB_ARQS="

:pegar
if "%~1"=="" goto :rodar
set "AMB_ARQS=%AMB_ARQS%|%~1"
shift
goto :pegar

:rodar
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$t=[IO.File]::ReadAllText($env:AMB_BAT,[Text.Encoding]::UTF8); $i=$t.IndexOf('#PS'+'-INICIO',[StringComparison]::Ordinal); & ([scriptblock]::Create($t.Substring($i)))"
echo.
pause
endlocal
exit /b
#PS-INICIO
# ======================================================================
#  Ambario - Exportar para o site (versao 3) - parte PowerShell
#  (o .bat acima so chama este trecho; tudo aqui e texto simples, sem acentos)
# ======================================================================
$ErrorActionPreference = 'Stop'
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture

$VERSAO = '3'
$G = @{ auto = $false; avisos = (New-Object System.Collections.ArrayList); resultados = (New-Object System.Collections.ArrayList) }
$PastaBat = if ($env:AMB_PASTA) { $env:AMB_PASTA.TrimEnd('\') } else { (Get-Location).Path }
$RUIDO = @('-hide_banner', '-loglevel', 'error', '-stats', '-nostdin', '-y')
$EH_WINDOWS = ($env:OS -eq 'Windows_NT')

# ---------------- mensagens ----------------
function Cabecalho([string]$t) {
  Write-Host ''
  Write-Host ('=' * 70) -ForegroundColor DarkCyan
  Write-Host (' ' + $t) -ForegroundColor Cyan
  Write-Host ('=' * 70) -ForegroundColor DarkCyan
}
function Ok([string]$t) { Write-Host ('  [OK] ' + $t) -ForegroundColor Green }
function Aviso([string]$t) { Write-Host ('  [!]  ' + $t) -ForegroundColor Yellow; [void]$G.avisos.Add($t) }
function Falha([string]$t) { Write-Host ('  [X]  ' + $t) -ForegroundColor Red }
function Dica([string]$t) { Write-Host ('       ' + $t) -ForegroundColor DarkGray }

function Perguntar([string]$texto, [string]$padrao) {
  if ($G.auto) { return $padrao }
  $r = Read-Host $texto
  if ($null -eq $r) { return $padrao }
  $r = $r.Trim().Trim('"')
  if ($r -eq '') { return $padrao }
  return $r
}
function SimNao([string]$texto, [bool]$padrao) {
  if ($G.auto) { return $padrao }
  $dica = if ($padrao) { 'Enter = S, ou N' } else { 'Enter = N, ou S' }
  $r = Read-Host ($texto + ' [' + $dica + ']')
  if ($null -eq $r) { return $padrao }
  $r = $r.Trim().ToUpper()
  if ($r -eq 'S') { return $true }
  if ($r -eq 'N') { return $false }
  return $padrao
}

# ---------------- formatos ----------------
function Dur([double]$s) {
  if ($s -lt 0) { $s = 0 }
  $t = [int][math]::Floor($s)
  $h = [int][math]::Floor($t / 3600)
  $m = [int][math]::Floor(($t % 3600) / 60)
  $x = $t % 60
  if ($h -gt 0) { return ('{0}:{1:00}:{2:00}' -f $h, $m, $x) }
  return ('{0}:{1:00}' -f $m, $x)
}
function Tam([double]$b) {
  if ($b -ge 1073741824) { return ('{0:0.00} GB' -f ($b / 1073741824)) }
  if ($b -ge 1048576) { return ('{0:0.0} MB' -f ($b / 1048576)) }
  return ('{0:0} KB' -f ($b / 1024))
}
function Num($s) {
  $d = 0.0
  if ($null -ne $s -and [double]::TryParse(([string]$s).Trim(), [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$d)) { return $d }
  return 0.0
}
function Fps([string]$s) {
  if ($s -match '^(\d+)/(\d+)$') {
    if ([double]$matches[2] -gt 0) { return ([double]$matches[1] / [double]$matches[2]) }
    return 0.0
  }
  return (Num $s)
}

# nome sem acentos e sem espacos: "Legiao Urbana - Sera" -> "legiao-urbana-sera"
function Slug([string]$s) {
  $n = $s.Normalize([System.Text.NormalizationForm]::FormD)
  $sb = New-Object System.Text.StringBuilder
  foreach ($ch in $n.ToCharArray()) {
    if ([System.Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne [System.Globalization.UnicodeCategory]::NonSpacingMark) { [void]$sb.Append($ch) }
  }
  $t = $sb.ToString().ToLower() -replace '[^a-z0-9]+', '-'
  return $t.Trim('-')
}

# ---------------- FFmpeg ----------------
function Achar-Exe([string]$nome) {
  foreach ($n in @(($nome + '.exe'), $nome)) {
    $c = Get-Command $n -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($c) { return $c.Source }
  }
  foreach ($p in @((Join-Path $PastaBat ($nome + '.exe')), (Join-Path $PastaBat ('ffmpeg\bin\' + $nome + '.exe')))) {
    if (Test-Path -LiteralPath $p) { return $p }
  }
  if ($env:LOCALAPPDATA) {
    $wg = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages'
    if (Test-Path -LiteralPath $wg) {
      $a = Get-ChildItem -LiteralPath $wg -Directory -Filter 'Gyan.FFmpeg*' -ErrorAction SilentlyContinue |
        ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Recurse -Filter ($nome + '.exe') -ErrorAction SilentlyContinue } | Select-Object -First 1
      if ($a) { return $a.FullName }
    }
  }
  return $null
}

function Q([string]$s) {
  $t = $s -replace '(\\*)"', '$1$1\"'
  $t = $t -replace '(\\+)$', '$1$1'
  return ('"' + $t + '"')
}

# roda um programa escondido e devolve a saida (stdout, stderr e codigo)
function Rodar([string]$exe, [string[]]$a) {
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $exe
  $psi.Arguments = (($a | ForEach-Object { Q $_ }) -join ' ')
  $psi.UseShellExecute = $false
  $psi.CreateNoWindow = $true
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.StandardOutputEncoding = [System.Text.Encoding]::UTF8
  $psi.StandardErrorEncoding = [System.Text.Encoding]::UTF8
  $p = [System.Diagnostics.Process]::Start($psi)
  $errTask = $p.StandardError.ReadToEndAsync()
  $out = $p.StandardOutput.ReadToEnd()
  $p.WaitForExit()
  return @{ out = $out; err = $errTask.Result; code = $p.ExitCode }
}

# roda o ffmpeg na janela (mostra o andamento) e devolve o codigo de saida
function Rodar-Visivel([string[]]$a) {
  $null = & $FFMPEG @a
  return $LASTEXITCODE
}

function Sondar([string]$arq) {
  $campos = 'stream=codec_type,codec_name,profile,width,height,pix_fmt,field_order,sample_aspect_ratio,avg_frame_rate,channels,sample_rate,duration:stream_tags=title,language:stream_disposition=attached_pic:format=duration,format_name'
  $r = Rodar $FFPROBE @('-v', 'error', '-show_entries', $campos, '-of', 'json', $arq)
  if ($r.code -ne 0 -or -not $r.out.Trim()) { throw 'O ffprobe nao conseguiu ler este arquivo (nao parece um video valido).' }
  return (ConvertFrom-Json $r.out)
}

function Sha([string]$f) { return (Get-FileHash -LiteralPath $f -Algorithm SHA256).Hash.ToLower() }

# SHA-256 dos pacotes de video/audio (o conteudo codificado, sem o envelope): prova que a copia nao mudou nada
function Hash-Pacotes([string]$arq, [string[]]$maps) {
  $a = @('-v', 'error', '-nostdin', '-i', $arq) + $maps + @('-c', 'copy', '-f', 'streamhash', '-hash', 'sha256', '-')
  $r = Rodar $FFMPEG $a
  $h = @{}
  foreach ($l in ($r.out -split "`r?`n")) {
    if ($l -match '^\d+,(\w),SHA256=([0-9a-fA-F]+)') { $h[$matches[1]] = $matches[2].ToLower() }
  }
  return $h
}

function Duracao-Arquivo([string]$f) {
  $r = Rodar $FFPROBE @('-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', $f)
  return (Num $r.out)
}

# ---------------- analise do arquivo ----------------
function Analisar([string]$arq) {
  $j = Sondar $arq
  $A = @{}
  $A.arq = $arq
  $A.nomeArq = [IO.Path]::GetFileName($arq)
  $A.tamanho = [double](Get-Item -LiteralPath $arq).Length
  $A.dur = Num $j.format.duration
  $A.formato = [string]$j.format.format_name
  $streams = @($j.streams)
  $todosV = @($streams | Where-Object { $_.codec_type -eq 'video' })
  $A.vOrd = -1
  for ($i = 0; $i -lt $todosV.Count; $i++) {
    if ($todosV[$i].disposition.attached_pic -ne 1) { $A.vOrd = $i; break }
  }
  if ($A.vOrd -lt 0) { throw 'Este arquivo nao tem faixa de video.' }
  $v = $todosV[$A.vOrd]
  $A.vcodec = [string]$v.codec_name
  $A.perfil = [string]$v.profile
  $A.w = [int]$v.width
  $A.h = [int]$v.height
  $A.pixfmt = [string]$v.pix_fmt
  $A.fieldOrder = if ($v.field_order) { [string]$v.field_order } else { 'unknown' }
  $A.sar = if ($v.sample_aspect_ratio) { [string]$v.sample_aspect_ratio } else { '1:1' }
  $A.fps = Fps ([string]$v.avg_frame_rate)
  if ($A.dur -le 0) { $A.dur = Num $v.duration }

  $lista = New-Object System.Collections.ArrayList
  $n = 0
  foreach ($s in $streams) {
    if ($s.codec_type -ne 'audio') { continue }
    $n++
    $titulo = ''
    $idioma = ''
    if ($s.tags) {
      if ($s.tags.title) { $titulo = [string]$s.tags.title }
      if ($s.tags.language) { $idioma = [string]$s.tags.language }
    }
    [void]$lista.Add(@{ ord = $n; codec = [string]$s.codec_name; canais = [int]$s.channels; taxa = [string]$s.sample_rate; titulo = $titulo; idioma = $idioma })
  }
  if ($lista.Count -eq 0) { throw 'Este arquivo nao tem nenhuma faixa de audio.' }
  $A.audios = @($lista)
  $A.nLegendas = @($streams | Where-Object { $_.codec_type -eq 'subtitle' }).Count
  $A.nAnexos = @($streams | Where-Object { $_.codec_type -eq 'attachment' }).Count
  return $A
}

# decide se a imagem e entrelacada: olha os quadros (idet); se nao der, usa o que o arquivo diz e o tamanho
function Detectar-Entrelacado($A) {
  $r = @{ entr = $false; motivo = ''; pct = -1 }
  try {
    $ini = [int][math]::Floor($A.dur / 4)
    $x = Rodar $FFMPEG @('-hide_banner', '-nostats', '-nostdin', '-ss', "$ini", '-i', $A.arq, '-map', ('0:v:' + $A.vOrd), '-an', '-sn', '-frames:v', '400', '-vf', 'idet', '-f', 'null', '-')
    $tot = 0
    $ent = 0
    foreach ($m in [regex]::Matches($x.err, 'Multi frame detection:\s*TFF:\s*(\d+)\s*BFF:\s*(\d+)\s*Progressive:\s*(\d+)\s*Undetermined:\s*(\d+)')) {
      $t = [int]$m.Groups[1].Value + [int]$m.Groups[2].Value + [int]$m.Groups[3].Value
      if ($t -gt 0) { $tot = $t; $ent = [int]$m.Groups[1].Value + [int]$m.Groups[2].Value }
    }
    if ($tot -ge 30) { $r.pct = [int][math]::Round(100.0 * $ent / $tot) }
  } catch { }
  $ord = $A.fieldOrder
  if ($r.pct -ge 60) {
    $r.entr = $true
    $r.motivo = ('os quadros mostram linhas entrelacadas: ' + $r.pct + '% (teste idet)')
  } elseif ($r.pct -ge 0 -and $r.pct -le 10) {
    $r.entr = $false
    $r.motivo = ('os quadros sao progressivos: so ' + $r.pct + '% entrelacado (teste idet)')
  } elseif (@('tt', 'bb', 'tb', 'bt') -contains $ord) {
    $r.entr = $true
    $r.motivo = ('o arquivo diz que e entrelacado (' + $ord + ')')
  } elseif ($ord -eq 'progressive') {
    $r.entr = $false
    $r.motivo = 'o arquivo diz que e progressivo'
  } elseif (@(480, 486, 576) -contains $A.h -and $A.w -ge 640) {
    $r.entr = $true
    $r.motivo = ('tamanho de captura de TV (' + $A.w + 'x' + $A.h + ')')
  } else {
    $r.entr = $false
    $r.motivo = ('parece copia digital (' + $A.w + 'x' + $A.h + ')')
  }
  return $r
}

# procura bordas pretas num trecho de 40 s; devolve "L:A:X:Y" ou $null
function Detectar-Corte($A) {
  try {
    $ini = [int][math]::Floor($A.dur / 4)
    $x = Rodar $FFMPEG @('-hide_banner', '-nostats', '-nostdin', '-ss', "$ini", '-i', $A.arq, '-t', '40', '-map', ('0:v:' + $A.vOrd), '-an', '-sn', '-vf', 'cropdetect=24:2:0', '-f', 'null', '-')
    $m = [regex]::Matches($x.err, 'crop=(\d+):(\d+):(\d+):(\d+)')
    if ($m.Count -gt 0) {
      $u = $m[$m.Count - 1]
      $cw = [int]$u.Groups[1].Value
      $ch = [int]$u.Groups[2].Value
      if (-not ($cw -eq $A.w -and $ch -eq $A.h) -and $cw -ge ($A.w / 2) -and $ch -ge ($A.h / 2)) { return $u.Value.Substring(5) }
    }
  } catch { }
  return $null
}

# 1 = disco, 2 = fita (padrao do EternalDub); se os nomes das faixas disserem "fita/VHS/tape", segue os nomes
function Sugerir-Faixas($A) {
  $n = $A.audios.Count
  $disco = 1
  $fita = 0
  if ($n -ge 2) {
    $fita = 2
    $achadas = @($A.audios | Where-Object { $_.titulo -match '(?i)fita|vhs|tape|cassete|gravac' })
    if ($achadas.Count -eq 1) {
      $fita = [int]$achadas[0].ord
      $disco = if ($fita -eq 1) { 2 } else { 1 }
    }
  }
  return @{ disco = $disco; fita = $fita }
}

# ---------------- o que sera feito ----------------
# audio que o navegador toca sem converter: pode ser copiado; o resto vira AAC
function Audio-Copiavel([string]$c) { return (@('aac', 'mp3', 'opus', 'flac') -contains $c) }

function Estrategia($A, $o) {
  $e = @{}
  $e.copV = ($A.vcodec -eq 'h264' -and @('yuv420p', 'yuvj420p') -contains $A.pixfmt)
  if ($e.copV) { $e.motivoV = '' }
  elseif ($A.vcodec -ne 'h264') { $e.motivoV = ('o video e ' + $A.vcodec + ', que o navegador nao toca') }
  else { $e.motivoV = ('o video e h264 ' + $A.pixfmt + ', que o navegador nao toca') }
  $e.disco = $A.audios[$o.disco - 1]
  $e.copD = Audio-Copiavel $e.disco.codec
  $e.fita = $null
  $e.copF = $false
  if ($o.fita -gt 0) {
    $e.fita = $A.audios[$o.fita - 1]
    $e.copF = Audio-Copiavel $e.fita.codec
  }
  return $e
}

function Altura-Final($A, $o) {
  if ($o.corte) { return [int]($o.corte.Split(':')[1]) }
  return [int]$A.h
}

# monta o filtro de imagem: entrelacamento, bordas, pixels nao quadrados / proporcao e (opcional) altura maxima
function Filtro($A, $o, [string]$modo, [int]$altMax) {
  $f = New-Object System.Collections.ArrayList
  if ($o.entr) { [void]$f.Add('bwdif=mode=' + $modo + ':deint=all') }
  if ($o.corte) { [void]$f.Add('crop=' + $o.corte) }
  if ($o.ar -eq '4') { [void]$f.Add('scale=trunc(ih*4/3/2)*2:trunc(ih/2)*2:flags=lanczos,setsar=1') }
  elseif ($o.ar -eq '16') { [void]$f.Add('scale=trunc(ih*16/9/2)*2:trunc(ih/2)*2:flags=lanczos,setsar=1') }
  else { [void]$f.Add('scale=trunc(iw*sar/2)*2:trunc(ih/2)*2:flags=lanczos,setsar=1') }
  if ($altMax -gt 0 -and (Altura-Final $A $o) -gt $altMax) { [void]$f.Add('scale=-2:' + $altMax + ':flags=lanczos') }
  return ($f -join ',')
}

function Taxa-Celular([int]$alt) {
  if ($alt -le 360) { return @{ crf = '24'; maxrate = '700k'; buf = '1400k' } }
  if ($alt -le 480) { return @{ crf = '23'; maxrate = '1200k'; buf = '2400k' } }
  if ($alt -le 576) { return @{ crf = '23'; maxrate = '1500k'; buf = '3000k' } }
  return @{ crf = '23'; maxrate = '2500k'; buf = '5000k' }
}

# onde o entrelacamento, as bordas e a proporcao valem: o MP4 so quando e recodificado; o celular quando existe
function Onde-Filtra($e, $o) {
  if ($o.mobile -and -not $e.copV) { return 'no MP4 e no arquivo celular' }
  if ($o.mobile) { return 'no arquivo celular' }
  if (-not $e.copV) { return 'no MP4' }
  return ''
}

function Mostrar-Plano($A, $o, $e, $pasta, $ent) {
  Cabecalho 'Ambario - Exportar para o site'
  Write-Host (' Arquivo : ' + $A.nomeArq + '   (' + (Tam $A.tamanho) + ', ' + (Dur $A.dur) + ')')
  $tipo = if ($ent.entr) { 'entrelacado' } else { 'progressivo' }
  Write-Host (' Video   : ' + $A.vcodec + ' ' + $A.w + 'x' + $A.h + ', ' + ('{0:0.##}' -f $A.fps) + ' quadros/s, ' + $tipo)
  Dica ($ent.motivo)
  foreach ($au in $A.audios) {
    $marca = ''
    if ($au.ord -eq $o.disco) { $marca = '   <- DISCO' }
    if ($au.ord -eq $o.fita) { $marca = '   <- FITA' }
    $t = ' Audio ' + $au.ord + ' : ' + $au.codec + ' ' + $au.canais + 'ch'
    if ($au.taxa) { $t += ' ' + $au.taxa + ' Hz' }
    if ($au.titulo) { $t += '  "' + $au.titulo + '"' }
    Write-Host ($t + $marca)
  }
  $onde = Onde-Filtra $e $o
  if ($o.corte -and $onde) { $p = $o.corte.Split(':'); Write-Host (' Bordas  : imagem util ' + $p[0] + 'x' + $p[1] + ' (corta ' + $onde + ')') }
  if ($A.nLegendas -gt 0 -or $A.nAnexos -gt 0) { Dica ('o MKV tem ' + $A.nLegendas + ' legenda(s) e ' + $A.nAnexos + ' anexo(s): nao entram no MP4, ficam so no MKV original') }
  Write-Host ''
  Write-Host (' Pasta   : ' + $pasta) -ForegroundColor White
  Write-Host ''
  Write-Host ' VAO SAIR 4 ARQUIVOS' -ForegroundColor White
  $n = $o.nome
  Write-Host ('  1) ' + $n + '.mkv  =  o original, integro (atalho no disco: nao ocupa espaco a mais)')
  if ($e.copV) {
    Write-Host ('  2) ' + $n + '.mp4  =  COPIA SEM PERDA (-c copy): a imagem e o audio do disco ficam exatamente como estao no MKV') -ForegroundColor Green
    if (-not $e.copD) { Write-Host ('     (o audio ' + $e.disco.codec + ' vira AAC 320k, porque o navegador nao toca; o original segue no MKV)') -ForegroundColor Yellow }
  } else {
    Write-Host ('  2) ' + $n + '.mp4  =  recodificado H.264 + AAC (' + $e.motivoV + '; o original segue no MKV)') -ForegroundColor Yellow
  }
  if ($o.fita -gt 0) {
    if ($e.copF) { Write-Host ('  3) ' + $n + '-fita.m4a  =  COPIA SEM PERDA (-c copy) do som da fita') -ForegroundColor Green }
    else { Write-Host ('  3) ' + $n + '-fita.m4a  =  som da fita em AAC 256k (o ' + $e.fita.codec + ' original segue no MKV)') -ForegroundColor Yellow }
  } else { Dica '3) sem som da fita (nenhuma faixa escolhida)' }
  if ($o.mobile) {
    $tx = Taxa-Celular $o.altMob
    $altF = [math]::Min((Altura-Final $A $o), $o.altMob)
    $q = @()
    if ($o.entr) { $q += 'tira o entrelacamento' }
    if ($o.corte) { $q += 'corta as bordas' }
    if ($o.ar -eq '4') { $q += 'forca 4:3' } elseif ($o.ar -eq '16') { $q += 'forca 16:9' } else { $q += 'pixels quadrados' }
    $est = $A.dur * (([double]($tx.maxrate -replace 'k', '') + 128) * 1000 / 8) * 0.7
    Write-Host ('  4) ' + $n + '_celular.mp4  =  ate ' + $altF + 'p, H.264 + AAC 128k, ~' + (Tam $est) + ': ' + ($q -join ', '))
  } else { Dica '4) sem arquivo para celular (desligado nos ajustes)' }
  Write-Host '     + conferencia automatica (pacotes identicos ao MKV, duracao, leitura sem erros)'
  Write-Host ''
}

function Ajustar($A, $o, $ent) {
  Write-Host ''
  Write-Host ' --- Ajustes (Enter mantem o que esta entre colchetes) ---' -ForegroundColor Cyan
  $r = Perguntar ('Nome dos arquivos [' + $o.nome + ']') ''
  if ($r) { $s = Slug $r; if ($s) { $o.nome = $s } }
  $n = $A.audios.Count
  $r = Perguntar ('Numero da faixa com o audio do DISCO [' + $o.disco + ']') ''
  if ($r -match '^\d{1,4}$' -and [int]$r -ge 1 -and [int]$r -le $n) { $o.disco = [int]$r }
  if ($n -ge 2) {
    $pad = if ($o.fita -gt 0) { [string]$o.fita } else { 'nenhuma' }
    $r = Perguntar ('Numero da faixa com o SOM DA FITA [' + $pad + ', N = nenhuma]') ''
    if ($r.ToUpper() -eq 'N') { $o.fita = 0 }
    elseif ($r -match '^\d{1,4}$' -and [int]$r -ge 1 -and [int]$r -le $n -and [int]$r -ne $o.disco) { $o.fita = [int]$r }
  }
  if ($o.fita -eq $o.disco) { $o.fita = 0 }
  $o.mobile = SimNao 'Gerar tambem o arquivo menor para celular?' $o.mobile
  $e2 = Estrategia $A $o
  $onde = Onde-Filtra $e2 $o
  if ($onde) {
    $o.entr = SimNao ('Tirar o entrelacamento ' + $onde + '?') $o.entr
    if ($o.corteDetectado) { $o.corte = if (SimNao ('Cortar as bordas pretas ' + $onde + '?') ([bool]$o.corte)) { $o.corteDetectado } else { $null } }
    Write-Host ('   Proporcao ' + $onde + ': Enter = manter (so acerta pixels nao quadrados), 4 = forcar 4:3 (imagem esticada), 16 = forcar 16:9')
    $r = Perguntar 'Proporcao [Enter, 4 ou 16]' ''
    if ($r -eq '4' -or $r -eq '4:3') { $o.ar = '4' } elseif ($r -eq '16' -or $r -eq '16:9') { $o.ar = '16' } else { $o.ar = '' }
  }
  if ($o.mobile) {
    $r = Perguntar ('Altura maxima do celular [' + $o.altMob + ']  (360 = mais leve, 720 = mais nitido)') ''
    if ($r -match '^\d{1,4}$' -and [int]$r -ge 144 -and [int]$r -le 2160) { $o.altMob = [int]$r }
  }
}

# ---------------- execucao ----------------
function Texto-Cmd([string[]]$core, [string]$arq, [string]$nomeArq, [string]$saida) {
  $itens = @()
  foreach ($c in $core) { if ($c -eq $arq) { $itens += $nomeArq } else { $itens += $c } }
  $itens += $saida
  $fmt = @()
  foreach ($i in $itens) { if ($i -match "[\s,;()'*&|<>]") { $fmt += ('"' + $i + '"') } else { $fmt += $i } }
  return ('ffmpeg ' + ($fmt -join ' '))
}

# roda o ffmpeg gravando num arquivo .part e so renomeia quando termina sem erro
function Passo([string]$rotulo, [string]$final, [string[]]$core, [string]$formato, [string]$cmdTxt) {
  $tmp = $final + '.part'
  if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force }
  Write-Host ''
  Write-Host ('  ' + $rotulo) -ForegroundColor White
  if ($cmdTxt) { Dica $cmdTxt }
  $t0 = Get-Date
  $cod = Rodar-Visivel ($RUIDO + $core + @('-f', $formato, $tmp))
  $bom = ($cod -eq 0 -and (Test-Path -LiteralPath $tmp))
  if ($bom) { if ((Get-Item -LiteralPath $tmp).Length -eq 0) { $bom = $false } }
  if (-not $bom) {
    if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force }
    return $false
  }
  if ([IO.File]::Exists($final)) { [IO.File]::Delete($final) }
  [IO.File]::Move($tmp, $final)
  $seg = [int][math]::Round(((Get-Date) - $t0).TotalSeconds)
  Dica ('pronto em ' + (Dur $seg))
  return $true
}

function Espaco-Livre([string]$pasta) {
  try {
    $d = New-Object System.IO.DriveInfo([IO.Path]::GetPathRoot($pasta))
    return [double]$d.AvailableFreeSpace
  } catch { return -1.0 }
}

function Criar-Atalho([string]$orig, [string]$dest) {
  try {
    if ($EH_WINDOWS) {
      $null = & cmd.exe /c mklink /H $dest $orig 2>&1
      return ($LASTEXITCODE -eq 0 -and (Test-Path -LiteralPath $dest))
    }
    $null = New-Item -ItemType HardLink -Path $dest -Value $orig  # (so fora do Windows; no Windows usa o mklink)
    return (Test-Path -LiteralPath $dest)
  } catch { return $false }
}

function Exportar-Um([string]$arqEntrada) {
  $res = @{ arq = $arqEntrada; estado = 'falhou'; pasta = ''; avisos = @(); nome = '' }
  $G.avisos.Clear()
  try {
    if (-not (Test-Path -LiteralPath $arqEntrada -PathType Leaf)) { throw ('Nao encontrei o arquivo: ' + $arqEntrada) }
    $arq = (Resolve-Path -LiteralPath $arqEntrada).ProviderPath
    $nomeArq = [IO.Path]::GetFileName($arq)

    # nome
    $nome = Slug ([IO.Path]::GetFileNameWithoutExtension($arq))
    if (-not $nome) { $nome = 'video' }
    if (-not $G.auto) {
      Write-Host ''
      Write-Host (' Arquivo: ' + $nomeArq) -ForegroundColor White
      Write-Host ' Nome dos arquivos novos (sem espacos e sem acentos, ex.: metro-olhar-1985)'
      $r = Perguntar ('[Enter = ' + $nome + ']') ''
      if ($r) { $s = Slug $r; if ($s) { $nome = $s } }
    }
    $res.nome = $nome

    Write-Host ''
    Write-Host ' Analisando o arquivo (faixas, entrelacamento, bordas pretas)...' -ForegroundColor DarkGray
    $A = Analisar $arq
    $ent = Detectar-Entrelacado $A
    $corte = Detectar-Corte $A
    $fx = Sugerir-Faixas $A
    $o = @{ nome = $nome; disco = $fx.disco; fita = $fx.fita; entr = $ent.entr; corte = $corte; corteDetectado = $corte; ar = ''; altMob = 480; mobile = $true; matriz = $true }

    $raiz = Join-Path (Split-Path -Parent $arq) 'para_o_site'
    $pasta = Join-Path $raiz $o.nome
    $e = Estrategia $A $o
    Mostrar-Plano $A $o $e $pasta $ent

    if (-not $G.auto) {
      $r = Perguntar ' [Enter] gerar assim    [C] ajustar    [X] cancelar' ''
      if ($r.ToUpper() -eq 'X') { $res.estado = 'cancelado'; Write-Host '  Cancelado. Nada foi criado.'; [void]$G.resultados.Add($res); return }
      if ($r.ToUpper() -eq 'C') {
        Ajustar $A $o $ent
        $pasta = Join-Path $raiz $o.nome
        $e = Estrategia $A $o
        Mostrar-Plano $A $o $e $pasta $ent
        $r = Perguntar ' [Enter] gerar assim    [X] cancelar' ''
        if ($r.ToUpper() -eq 'X') { $res.estado = 'cancelado'; Write-Host '  Cancelado. Nada foi criado.'; [void]$G.resultados.Add($res); return }
      }
    }
    $nome = $o.nome
    $res.nome = $nome
    $res.pasta = $pasta

    # arquivos de saida
    [void][IO.Directory]::CreateDirectory($pasta)
    Get-ChildItem -LiteralPath $pasta -Filter '*.part' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
    $fMp4 = Join-Path $pasta ($nome + '.mp4')
    $fFita = Join-Path $pasta ($nome + '-fita.m4a')
    $fCel = Join-Path $pasta ($nome + '_celular.mp4')
    $fMkv = Join-Path $pasta ($nome + '.mkv')

    # ja existe? (nao apaga nada sem perguntar)
    $refazer = $false
    $existem = @()
    foreach ($f in @($fMp4, $fFita, $fCel)) { if (Test-Path -LiteralPath $f) { $existem += [IO.Path]::GetFileName($f) } }
    if ($existem.Count -gt 0) {
      Write-Host ('  Ja existem nesta pasta: ' + ($existem -join ', ')) -ForegroundColor Yellow
      $r = Perguntar '  [Enter] pular o que ja existe    [R] refazer tudo (o arquivo antigo so e trocado quando o novo ficar pronto)' ''
      if ($r.ToUpper() -eq 'R') { $refazer = $true }
    }

    # espaco em disco
    $livre = Espaco-Livre $pasta
    $folga = 31457280
    if ($e.copV) { $precisa = $A.tamanho * 1.05 + $folga } else { $precisa = $A.tamanho * 0.6 + $folga }
    if ($o.mobile) { $precisa += $A.dur * 200000 }
    if ($livre -ge 0 -and $livre -lt $precisa) {
      Aviso ('Pouco espaco livre: ' + (Tam $livre) + ' livres e a exportacao precisa de uns ' + (Tam $precisa) + '.')
      if (-not (SimNao '  Continuar mesmo assim?' $false)) { $res.estado = 'cancelado'; Write-Host '  Cancelado. Nada foi criado.'; [void]$G.resultados.Add($res); return }
    }

    $falhas = 0
    $verif = New-Object System.Collections.ArrayList

    Cabecalho ('Exportando: ' + $nome)

    $d0 = $o.disco - 1
    $f0 = $o.fita - 1

    # [1] o original (matriz) na pasta de envio: atalho de disco, sem ocupar espaco e sem mexer no arquivo
    $matrizEstado = 'nao'
    Write-Host ''
    Write-Host ('  [1/4] ' + $nome + '.mkv  (o original, integro)') -ForegroundColor White
    if (Test-Path -LiteralPath $fMkv) {
      $matrizEstado = 'existe'
      Dica 'ja existe na pasta: mantido'
    } elseif (Criar-Atalho $arq $fMkv) {
      $matrizEstado = 'atalho'
      Ok 'Original na pasta como atalho de disco (nao gastou espaco).'
    } elseif (SimNao '  Nao deu para criar o atalho (disco exFAT/FAT ou outra unidade). Copiar o MKV para a pasta? (gasta espaco)' $false) {
      Write-Host '  Copiando e conferindo a copia (SHA-256 do original e da copia)...' -ForegroundColor DarkGray
      [IO.File]::Copy($arq, $fMkv)
      if ((Sha $fMkv) -eq (Sha $arq)) { $matrizEstado = 'copia'; [void]$verif.Add('OK   MKV: copia na pasta conferida (SHA-256 igual ao original).'); Ok 'Original copiado e conferido (SHA-256 igual).' }
      else { Remove-Item -LiteralPath $fMkv -Force; Aviso 'A copia do MKV nao bateu com o original e foi descartada. Envie o MKV original direto.'; $falhas++ }
    } else {
      Dica 'o MKV nao foi colocado na pasta: envie o MKV original direto'
    }

    # [2] MP4 do site (copia sem perda, ou recodificado se o navegador nao tocar o original)
    if ($e.copV) {
      $core1 = @('-i', $arq, '-map', ('0:v:' + $A.vOrd), '-map', ('0:a:' + $d0), '-c:v', 'copy')
      if ($e.copD) { $core1 += @('-c:a', 'copy') } else { $core1 += @('-c:a', 'aac', '-b:a', '320k') }
      $core1 += @('-movflags', '+faststart')
      $rot1 = '[2/4] ' + $nome + '.mp4  (copia sem perda: so troca o envelope MKV por MP4)'
    } else {
      $vf1 = Filtro $A $o 'send_field' 0
      $core1 = @('-i', $arq, '-map', ('0:v:' + $A.vOrd), '-map', ('0:a:' + $d0), '-vf', $vf1, '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-maxrate', '3500k', '-bufsize', '7000k', '-g', '120', '-keyint_min', '24', '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p', '-af', 'aresample=async=1:first_pts=0', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-map_metadata', '-1', '-map_chapters', '-1')
      $rot1 = '[2/4] ' + $nome + '.mp4  (recodificado; pode levar alguns minutos)'
    }
    if ((Test-Path -LiteralPath $fMp4) -and -not $refazer) {
      Write-Host ''
      Write-Host ('  [2/4] ' + $nome + '.mp4 ja existe: mantido') -ForegroundColor DarkGray
    } elseif (-not (Passo $rot1 $fMp4 $core1 'mp4' (Texto-Cmd $core1 $arq $nomeArq ($nome + '.mp4')))) {
      Falha ('O FFmpeg nao conseguiu gerar ' + $nome + '.mp4 (veja a mensagem acima). Nada foi apagado.')
      $falhas++
    }
    if (Test-Path -LiteralPath $fMp4) {
      if ($e.copV -and $e.copD) {
        $h1 = Hash-Pacotes $arq @('-map', ('0:v:' + $A.vOrd), '-map', ('0:a:' + $d0))
        $h2 = Hash-Pacotes $fMp4 @('-map', '0:v:0', '-map', '0:a:0')
        if ($h1['v'] -and $h1['v'] -eq $h2['v'] -and $h1['a'] -and $h1['a'] -eq $h2['a']) { [void]$verif.Add('OK   MP4: pacotes de video e de audio identicos aos do MKV (SHA-256 de cada fluxo).'); Ok 'MP4: video e audio identicos aos do MKV (conferido por SHA-256).' }
        else { [void]$verif.Add('ATENCAO MP4: os pacotes nao batem byte a byte com o MKV. Guarde o MKV e confira o MP4.'); Aviso 'MP4: os pacotes nao batem com o MKV. Guarde o MKV e confira o MP4.' }
      } elseif ($e.copV) {
        $h1 = Hash-Pacotes $arq @('-map', ('0:v:' + $A.vOrd))
        $h2 = Hash-Pacotes $fMp4 @('-map', '0:v:0')
        if ($h1['v'] -and $h1['v'] -eq $h2['v']) { [void]$verif.Add('OK   MP4: pacotes de video identicos aos do MKV (SHA-256). O audio foi convertido para AAC.'); Ok 'MP4: video identico ao do MKV (SHA-256); audio convertido para AAC.' }
        else { [void]$verif.Add('ATENCAO MP4: o video nao bate byte a byte com o MKV.'); Aviso 'MP4: o video nao bate com o MKV. Guarde o MKV.' }
      }
      $dm = Duracao-Arquivo $fMp4
      if ([math]::Abs($dm - $A.dur) -le 1.5) { [void]$verif.Add(('OK   MP4: duracao ' + (Dur $dm) + ' (MKV ' + (Dur $A.dur) + ').')) }
      else { [void]$verif.Add(('ATENCAO MP4: duracao ' + (Dur $dm) + ' diferente do MKV (' + (Dur $A.dur) + ').')); Aviso ('MP4: duracao ' + (Dur $dm) + ' diferente do MKV (' + (Dur $A.dur) + ').') }
    }

    # [3] som da fita (copia sem perda)
    if ($o.fita -gt 0) {
      $core2 = @('-i', $arq, '-map', ('0:a:' + $f0), '-vn')
      if ($e.copF) { $core2 += @('-c:a', 'copy') } else { $core2 += @('-c:a', 'aac', '-b:a', '256k') }
      $core2 += @('-movflags', '+faststart')
      $rot2 = '[3/4] ' + $nome + '-fita.m4a  (convertido para AAC)'
      if ($e.copF) { $rot2 = '[3/4] ' + $nome + '-fita.m4a  (copia sem perda)' }
      if ((Test-Path -LiteralPath $fFita) -and -not $refazer) {
        Write-Host ''
        Write-Host ('  [3/4] ' + $nome + '-fita.m4a ja existe: mantido') -ForegroundColor DarkGray
      } elseif (-not (Passo $rot2 $fFita $core2 'mp4' (Texto-Cmd $core2 $arq $nomeArq ($nome + '-fita.m4a')))) {
        Falha ('O FFmpeg nao conseguiu gerar ' + $nome + '-fita.m4a. Nada foi apagado.')
        $falhas++
      }
      if (Test-Path -LiteralPath $fFita) {
        if ($e.copF) {
          $h1 = Hash-Pacotes $arq @('-map', ('0:a:' + $f0))
          $h2 = Hash-Pacotes $fFita @('-map', '0:a:0')
          if ($h1['a'] -and $h1['a'] -eq $h2['a']) { [void]$verif.Add('OK   M4A: pacotes de audio identicos aos do MKV (SHA-256).'); Ok 'M4A: audio identico ao do MKV (conferido por SHA-256).' }
          else { [void]$verif.Add('ATENCAO M4A: os pacotes nao batem byte a byte com o MKV.'); Aviso 'M4A: os pacotes nao batem com o MKV. Guarde o MKV.' }
        }
        $dm = Duracao-Arquivo $fFita
        if ([math]::Abs($dm - $A.dur) -le 1.5) { [void]$verif.Add(('OK   M4A: duracao ' + (Dur $dm) + ' (MKV ' + (Dur $A.dur) + '): na mesma linha do tempo.')) }
        else { [void]$verif.Add(('ATENCAO M4A: duracao ' + (Dur $dm) + ' diferente do MKV (' + (Dur $A.dur) + '). Confira o sincronismo.')); Aviso ('M4A: duracao ' + (Dur $dm) + ' diferente do MKV (' + (Dur $A.dur) + ').') }
      }
    } else {
      Write-Host ''
      Write-Host '  [3/4] sem som da fita: pulado' -ForegroundColor DarkGray
    }

    # [4] arquivo menor para celular
    if ($o.mobile) {
      $tx = Taxa-Celular $o.altMob
      $vf3 = Filtro $A $o 'send_frame' $o.altMob
      $core3 = @('-i', $arq, '-map', ('0:v:' + $A.vOrd), '-map', ('0:a:' + $d0), '-vf', $vf3, '-c:v', 'libx264', '-preset', 'slow', '-crf', $tx.crf, '-maxrate', $tx.maxrate, '-bufsize', $tx.buf, '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-g', '60', '-af', 'aresample=async=1:first_pts=0', '-c:a', 'aac', '-b:a', '128k', '-ac', '2', '-movflags', '+faststart', '-map_metadata', '-1', '-map_chapters', '-1')
      if ((Test-Path -LiteralPath $fCel) -and -not $refazer) {
        Write-Host ''
        Write-Host ('  [4/4] ' + $nome + '_celular.mp4 ja existe: mantido') -ForegroundColor DarkGray
      } elseif (-not (Passo ('[4/4] ' + $nome + '_celular.mp4  (versao leve, toca em qualquer celular; pode levar alguns minutos)') $fCel $core3 'mp4' (Texto-Cmd $core3 $arq $nomeArq ($nome + '_celular.mp4')))) {
        Falha ('O FFmpeg nao conseguiu gerar ' + $nome + '_celular.mp4. Nada foi apagado.')
        $falhas++
      }
      if (Test-Path -LiteralPath $fCel) {
        $dm = Duracao-Arquivo $fCel
        $dc = Rodar $FFMPEG @('-v', 'error', '-nostdin', '-i', $fCel, '-f', 'null', '-')
        $lim = $dc.err.Trim()
        if ([math]::Abs($dm - $A.dur) -le 1.5) { [void]$verif.Add(('OK   Celular: duracao ' + (Dur $dm) + ' (MKV ' + (Dur $A.dur) + ').')) }
        else { [void]$verif.Add(('ATENCAO Celular: duracao ' + (Dur $dm) + ' diferente do MKV (' + (Dur $A.dur) + ').')); Aviso ('Celular: duracao ' + (Dur $dm) + ' diferente do MKV (' + (Dur $A.dur) + ').') }
        if ($dc.code -eq 0 -and -not $lim) { [void]$verif.Add('OK   Celular: o arquivo le do comeco ao fim sem nenhum erro.'); Ok 'Celular: leu do comeco ao fim sem erros.' }
        else { [void]$verif.Add('ATENCAO Celular: o FFmpeg reclamou ao ler o arquivo de ponta a ponta.'); Aviso 'Celular: o FFmpeg reclamou ao ler o arquivo. Refaca esta etapa.' }
      }
    } else {
      Write-Host ''
      Write-Host '  [4/4] arquivo celular: pulado (desligado nos ajustes)' -ForegroundColor DarkGray
    }

    # resumo
    Cabecalho 'Pronto'
    Write-Host (' Pasta: ' + $pasta)
    Write-Host ''
    foreach ($arqSaida in @($fMkv, $fMp4, $fFita, $fCel)) {
      if (Test-Path -LiteralPath $arqSaida) { Write-Host ('  ' + ([IO.Path]::GetFileName($arqSaida)).PadRight(48) + (Tam ([double](Get-Item -LiteralPath $arqSaida).Length)).PadLeft(10)) }
    }
    Write-Host ''
    Write-Host ' Conferencias:' -ForegroundColor White
    foreach ($v in $verif) {
      if ($v.StartsWith('OK')) { Write-Host ('  ' + $v) -ForegroundColor Green } else { Write-Host ('  ' + $v) -ForegroundColor Yellow }
    }
    if ($G.avisos.Count -gt 0) {
      Write-Host ''
      Write-Host ' ATENCAO:' -ForegroundColor Yellow
      foreach ($w in $G.avisos) { Write-Host ('  - ' + $w) -ForegroundColor Yellow }
    }
    $res.avisos = @($G.avisos)
    if ($falhas -gt 0) { $res.estado = 'falhou' } elseif ($G.avisos.Count -gt 0) { $res.estado = 'avisos' } else { $res.estado = 'ok' }
  } catch {
    Falha $_.Exception.Message
    $res.estado = 'falhou'
  }
  [void]$G.resultados.Add($res)
}

# ======================================================================
#  inicio
# ======================================================================
try {
  $FFMPEG = Achar-Exe 'ffmpeg'
  $FFPROBE = Achar-Exe 'ffprobe'
  if (-not $FFMPEG -or -not $FFPROBE) {
    Write-Host ''
    Write-Host 'Nao encontrei o FFmpeg.' -ForegroundColor Red
    Write-Host 'Instale com:  winget install Gyan.FFmpeg'
    Write-Host 'ou coloque ffmpeg.exe e ffprobe.exe ao lado deste arquivo .bat.'
    exit 1
  }

  $arquivos = @()
  if ($env:AMB_ARQS) { $arquivos = @($env:AMB_ARQS -split '\|' | Where-Object { $_ -and $_.Trim() }) }
  if ($arquivos.Count -eq 0) {
    Write-Host ''
    Write-Host 'Arraste o arquivo MKV para cima do .bat (pode ser mais de um), ou cole o caminho aqui.'
    $r = Perguntar 'Arquivo' ''
    if ($r) { $arquivos = @($r) }
  }
  if ($arquivos.Count -eq 0) { Write-Host 'Nenhum arquivo informado.'; exit 1 }
  if ($arquivos.Count -gt 1) {
    $G.auto = $true
    Cabecalho ('Ambario - Exportar para o site: ' + $arquivos.Count + ' arquivos (modo automatico: aceita as sugestoes)')
  }

  $i = 0
  foreach ($f in $arquivos) {
    $i++
    if ($arquivos.Count -gt 1) { Write-Host ''; Write-Host ('>>> Arquivo ' + $i + ' de ' + $arquivos.Count + ': ' + $f) -ForegroundColor Cyan }
    [void](Exportar-Um $f)
  }

  if ($arquivos.Count -gt 1) {
    Cabecalho 'Resumo'
    foreach ($r in $G.resultados) {
      $cor = 'Green'
      $txt = 'ok'
      if ($r.estado -eq 'avisos') { $cor = 'Yellow'; $txt = 'ok, com avisos' }
      if ($r.estado -eq 'falhou') { $cor = 'Red'; $txt = 'FALHOU' }
      if ($r.estado -eq 'cancelado') { $cor = 'DarkGray'; $txt = 'cancelado' }
      Write-Host ('  ' + ([string]$r.nome).PadRight(40) + $txt) -ForegroundColor $cor
    }
  }

  # abre a pasta do (ultimo) item
  $ult = $G.resultados | Where-Object { $_.pasta -and (Test-Path -LiteralPath $_.pasta) } | Select-Object -Last 1
  if ($ult -and $EH_WINDOWS) {
    $abrir = $ult.pasta
    if ($arquivos.Count -gt 1) { $abrir = Split-Path -Parent $ult.pasta }
    try { Start-Process explorer.exe -ArgumentList ('"' + $abrir + '"') } catch { }
  }
} catch {
  Write-Host ''
  Write-Host ('Erro inesperado: ' + $_.Exception.Message) -ForegroundColor Red
  Write-Host ('(linha ' + $_.InvocationInfo.ScriptLineNumber + ' do trecho PowerShell)') -ForegroundColor DarkGray
}
