# ======================================================================
#  Ambário - Exportador para o site (versão com janela)
#
#  Faz o mesmo que o Exportar_para_o_site.bat, numa janela:
#  arraste o MKV do EternalDub (faixa 1 = disco, faixa 2 = fita), confira
#  as opções e clique em Exportar. Numa pasta "para_o_site\NOME" saem só 4 arquivos:
#    NOME.mkv          o original, íntegro (atalho de disco: não gasta espaço)
#    NOME.mp4          cópia sem perda (-c copy) do vídeo e do áudio do disco;
#                      só recodifica se o navegador não tocar o original
#    NOME-fita.m4a     som original da fita (cópia sem perda quando possível)
#    NOME_celular.mp4  versão leve para celular (H.264 até 480p + AAC estéreo)
#  A conferência (pacotes idênticos ao MKV, duração, leitura sem erros) aparece
#  na janela, sem criar arquivos. O MKV original nunca é alterado. Cada arquivo é escrito como .part e só ganha
#  o nome final quando o FFmpeg termina sem erro.
#  Para abrir: dois cliques em "Exportador_Ambario.bat" (ao lado deste arquivo).
#  Precisa do FFmpeg (o mesmo do EternalDub): no PATH, ao lado deste arquivo,
#  ou instalado com: winget install Gyan.FFmpeg
# ======================================================================

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$ErrorActionPreference = 'Stop'
$VERSAO = '2.0'
# pasta deste programa (o .bat passa em AMB_PASTA, porque carrega o script já como UTF-8)
$Pasta = if ($env:AMB_PASTA) { $env:AMB_PASTA.TrimEnd('\') } elseif ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
# qualquer erro inesperado aparece numa janela (em vez de o programa sumir sem explicar)
trap {
  [System.Windows.Forms.MessageBox]::Show("O Exportador encontrou um erro:`n`n" + $_.Exception.Message + "`n`n(linha " + $_.InvocationInfo.ScriptLineNumber + ')', 'Ambário - Exportador', 'OK', 'Error') | Out-Null
  break
}

# ---------------- FFmpeg ----------------
function Achar-Exe([string]$nome) {
  $c = Get-Command "$nome.exe" -ErrorAction SilentlyContinue
  if ($c) { return $c.Source }
  foreach ($p in @("$Pasta\$nome.exe", "$Pasta\ffmpeg\bin\$nome.exe")) { if (Test-Path $p) { return $p } }
  $wg = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages'
  if (Test-Path $wg) {
    $a = Get-ChildItem $wg -Directory -Filter 'Gyan.FFmpeg*' -ErrorAction SilentlyContinue |
      ForEach-Object { Get-ChildItem $_.FullName -Recurse -Filter "$nome.exe" -ErrorAction SilentlyContinue } | Select-Object -First 1
    if ($a) { return $a.FullName }
  }
  return $null
}
$FFMPEG = Achar-Exe 'ffmpeg'
$FFPROBE = Achar-Exe 'ffprobe'
if (-not $FFMPEG -or -not $FFPROBE) {
  [System.Windows.Forms.MessageBox]::Show("Não encontrei o FFmpeg.`n`nInstale com:  winget install Gyan.FFmpeg`nou coloque ffmpeg.exe e ffprobe.exe na mesma pasta deste programa.", 'Ambário - Exportador', 'OK', 'Error') | Out-Null
  exit
}

# Roda um programa escondido e devolve a saída (stdout + stderr)
function Rodar([string]$exe, [string]$argumentos) {
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $exe
  $psi.Arguments = $argumentos
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
function Q([string]$s) { return '"' + $s + '"' }

# nome de arquivo sem acentos e sem espaços: "Legião Urbana - Será" -> "legiao-urbana-sera"
function Slug([string]$s) {
  $n = $s.Normalize([System.Text.NormalizationForm]::FormD)
  $sb = New-Object System.Text.StringBuilder
  foreach ($ch in $n.ToCharArray()) {
    if ([System.Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne [System.Globalization.UnicodeCategory]::NonSpacingMark) { [void]$sb.Append($ch) }
  }
  $t = $sb.ToString().ToLower() -replace '[^a-z0-9]+', '-'
  return $t.Trim('-')
}

# ---------------- janela ----------------
$fonte = New-Object System.Drawing.Font('Segoe UI', 9.5)
$fonteB = New-Object System.Drawing.Font('Segoe UI', 9.5, [System.Drawing.FontStyle]::Bold)
$form = New-Object System.Windows.Forms.Form
$form.Text = 'Ambário - Exportar para o site'
$form.Size = New-Object System.Drawing.Size(780, 760)
$form.MinimumSize = $form.Size
$form.StartPosition = 'CenterScreen'
$form.Font = $fonte
$form.AllowDrop = $true
$form.BackColor = [System.Drawing.Color]::FromArgb(246, 249, 253)

function Rotulo($txt, $x, $y, $w = 160, $negrito = $false) {
  $l = New-Object System.Windows.Forms.Label
  $l.Text = $txt; $l.Location = New-Object System.Drawing.Point($x, $y); $l.Size = New-Object System.Drawing.Size($w, 22)
  if ($negrito) { $l.Font = $fonteB }
  $form.Controls.Add($l); return $l
}

# 1. arquivo
$zona = New-Object System.Windows.Forms.Label
$zona.Text = "Arraste o MKV do EternalDub para cá`nou clique para escolher"
$zona.TextAlign = 'MiddleCenter'
$zona.BorderStyle = 'FixedSingle'
$zona.BackColor = [System.Drawing.Color]::White
$zona.ForeColor = [System.Drawing.Color]::FromArgb(60, 90, 130)
$zona.Font = New-Object System.Drawing.Font('Segoe UI', 11)
$zona.Location = New-Object System.Drawing.Point(16, 14)
$zona.Size = New-Object System.Drawing.Size(500, 70)
$zona.Cursor = 'Hand'
$form.Controls.Add($zona)

$prev = New-Object System.Windows.Forms.PictureBox
$prev.Location = New-Object System.Drawing.Point(530, 14)
$prev.Size = New-Object System.Drawing.Size(216, 162)
$prev.SizeMode = 'Zoom'
$prev.BackColor = [System.Drawing.Color]::Black
$form.Controls.Add($prev)

$lInfo = Rotulo '' 16 90 500
$lInfo.ForeColor = [System.Drawing.Color]::DimGray

# 2. opções
Rotulo 'Nome dos arquivos' 16 122 150 $true | Out-Null
$tNome = New-Object System.Windows.Forms.TextBox
$tNome.Location = New-Object System.Drawing.Point(170, 120); $tNome.Size = New-Object System.Drawing.Size(346, 24)
$form.Controls.Add($tNome)
$lId = Rotulo '' 170 146 350
$lId.ForeColor = [System.Drawing.Color]::DimGray

Rotulo 'Áudio do DISCO' 16 180 150 $true | Out-Null
$cDisco = New-Object System.Windows.Forms.ComboBox
$cDisco.DropDownStyle = 'DropDownList'; $cDisco.Location = New-Object System.Drawing.Point(170, 177); $cDisco.Size = New-Object System.Drawing.Size(576, 24)
$form.Controls.Add($cDisco)
Rotulo 'Som da FITA' 16 212 150 $true | Out-Null
$cFita = New-Object System.Windows.Forms.ComboBox
$cFita.DropDownStyle = 'DropDownList'; $cFita.Location = New-Object System.Drawing.Point(170, 209); $cFita.Size = New-Object System.Drawing.Size(576, 24)
$form.Controls.Add($cFita)

$chEntr = New-Object System.Windows.Forms.CheckBox
$chEntr.Text = 'Tirar o entrelaçamento (captura de fita VHS)'
$chEntr.Location = New-Object System.Drawing.Point(16, 246); $chEntr.Size = New-Object System.Drawing.Size(330, 24)
$form.Controls.Add($chEntr)
$lEntr = Rotulo '' 350 249 400
$lEntr.ForeColor = [System.Drawing.Color]::DimGray

$chCorte = New-Object System.Windows.Forms.CheckBox
$chCorte.Text = 'Cortar as bordas pretas'
$chCorte.Location = New-Object System.Drawing.Point(16, 274); $chCorte.Size = New-Object System.Drawing.Size(330, 24)
$form.Controls.Add($chCorte)
$lCorte = Rotulo '' 350 277 400
$lCorte.ForeColor = [System.Drawing.Color]::DimGray

Rotulo 'Proporção final' 16 308 150 $true | Out-Null
$cProp = New-Object System.Windows.Forms.ComboBox
$cProp.DropDownStyle = 'DropDownList'; $cProp.Location = New-Object System.Drawing.Point(170, 305); $cProp.Size = New-Object System.Drawing.Size(576, 24)
[void]$cProp.Items.AddRange(@('Manter como está (só acerta pixels não quadrados)', 'Forçar 4:3 (imagem 4:3 que foi esticada para 16:9)', 'Forçar 16:9'))
$cProp.SelectedIndex = 0
$form.Controls.Add($cProp)

$chCopia = New-Object System.Windows.Forms.CheckBox
$chCopia.Text = 'Copiar sem perda quando o arquivo permitir (recomendado)'
$chCopia.Checked = $true
$chCopia.Location = New-Object System.Drawing.Point(16, 338); $chCopia.Size = New-Object System.Drawing.Size(500, 24)
$form.Controls.Add($chCopia)
$lCopia = Rotulo '' 36 362 710
$lCopia.ForeColor = [System.Drawing.Color]::DimGray
$lCopia.AutoSize = $false
$lCopia.Size = New-Object System.Drawing.Size(710, 38)

$chCel = New-Object System.Windows.Forms.CheckBox
$chCel.Text = 'Fazer a versão leve para celular (NOME_celular.mp4)'
$chCel.Checked = $true
$chCel.Location = New-Object System.Drawing.Point(16, 404); $chCel.Size = New-Object System.Drawing.Size(390, 24)
$form.Controls.Add($chCel)
Rotulo 'altura máxima' 420 407 100 | Out-Null
$cCel = New-Object System.Windows.Forms.ComboBox
$cCel.DropDownStyle = 'DropDownList'; $cCel.Location = New-Object System.Drawing.Point(520, 403); $cCel.Size = New-Object System.Drawing.Size(120, 24)
[void]$cCel.Items.AddRange(@('480p', '360p', '576p'))
$cCel.SelectedIndex = 0
$form.Controls.Add($cCel)
$chCel.Add_CheckedChanged({ $cCel.Enabled = $chCel.Checked })

$chMatriz = New-Object System.Windows.Forms.CheckBox
$chMatriz.Text = 'Pôr a matriz (MKV) na pasta, como atalho de disco (não gasta espaço)'
$chMatriz.Checked = $true
$chMatriz.Location = New-Object System.Drawing.Point(16, 432); $chMatriz.Size = New-Object System.Drawing.Size(600, 24)
$form.Controls.Add($chMatriz)

Rotulo 'Salvar em' 16 470 150 $true | Out-Null
$tSaida = New-Object System.Windows.Forms.TextBox
$tSaida.Location = New-Object System.Drawing.Point(170, 467); $tSaida.Size = New-Object System.Drawing.Size(486, 24)
$form.Controls.Add($tSaida)
$bSaida = New-Object System.Windows.Forms.Button
$bSaida.Text = 'Escolher…'; $bSaida.Location = New-Object System.Drawing.Point(662, 466); $bSaida.Size = New-Object System.Drawing.Size(84, 26)
$form.Controls.Add($bSaida)
$lSaida = Rotulo 'Uma pasta por título é criada dentro desta.' 170 494 576
$lSaida.ForeColor = [System.Drawing.Color]::DimGray

# 3. exportar
$bExp = New-Object System.Windows.Forms.Button
$bExp.Text = 'Exportar'
$bExp.Font = New-Object System.Drawing.Font('Segoe UI', 11, [System.Drawing.FontStyle]::Bold)
$bExp.BackColor = [System.Drawing.Color]::FromArgb(255, 214, 64)
$bExp.FlatStyle = 'Flat'
$bExp.Location = New-Object System.Drawing.Point(16, 524); $bExp.Size = New-Object System.Drawing.Size(160, 40)
$bExp.Enabled = $false
$form.Controls.Add($bExp)
$bCancelar = New-Object System.Windows.Forms.Button
$bCancelar.Text = 'Cancelar'; $bCancelar.Location = New-Object System.Drawing.Point(184, 524); $bCancelar.Size = New-Object System.Drawing.Size(90, 40)
$bCancelar.Enabled = $false
$form.Controls.Add($bCancelar)
$bAbrir = New-Object System.Windows.Forms.Button
$bAbrir.Text = 'Abrir a pasta'; $bAbrir.Location = New-Object System.Drawing.Point(282, 524); $bAbrir.Size = New-Object System.Drawing.Size(110, 40)
$bAbrir.Enabled = $false
$form.Controls.Add($bAbrir)

$barra = New-Object System.Windows.Forms.ProgressBar
$barra.Location = New-Object System.Drawing.Point(16, 574); $barra.Size = New-Object System.Drawing.Size(730, 18); $barra.Maximum = 1000
$form.Controls.Add($barra)
$lEtapa = Rotulo 'Escolha um arquivo para começar.' 16 596 730

$log = New-Object System.Windows.Forms.TextBox
$log.Multiline = $true; $log.ReadOnly = $true; $log.ScrollBars = 'Vertical'
$log.Font = New-Object System.Drawing.Font('Consolas', 9)
$log.Location = New-Object System.Drawing.Point(16, 622); $log.Size = New-Object System.Drawing.Size(730, 90)
$log.Anchor = 'Top, Bottom, Left, Right'
$form.Controls.Add($log)
function Log([string]$t) { $log.AppendText($t + "`r`n") }

# ---------------- estado ----------------
$S = @{ arquivo = $null; dur = 0.0; larg = 0; alt = 0; corte = $null; proc = $null; etapas = @(); etapa = -1; progresso = $null; inicio = $null; tmpPrev = $null; vcodec = ''; pixfmt = ''; audios = @(); tamanho = 0.0; carregando = $false; concluindo = $false; estr = $null; cmds = @(); fitaIdx = -1; pri = 0; o = @{} }

# filtro de imagem. modo: send_field (59,94 q/s, recodificar o MP4) ou send_frame (29,97 q/s, celular e capa).
# altMax > 0 limita a altura (só diminui, nunca aumenta).
function Filtro([string]$modo = 'send_field', [int]$altMax = 0) {
  $f = @()
  if ($chEntr.Checked) { $f += ('bwdif=mode=' + $modo + ':deint=all') }
  if ($chCorte.Checked -and $S.corte) { $f += "crop=$($S.corte)" }
  switch ($cProp.SelectedIndex) {
    1 { $f += 'scale=trunc(ih*4/3/2)*2:trunc(ih/2)*2:flags=lanczos,setsar=1' }
    2 { $f += 'scale=trunc(ih*16/9/2)*2:trunc(ih/2)*2:flags=lanczos,setsar=1' }
    default { $f += 'scale=trunc(iw*sar/2)*2:trunc(ih/2)*2:flags=lanczos,setsar=1' }
  }
  if ($altMax -gt 0) {
    $hf = [int]$S.alt
    if ($chCorte.Checked -and $S.corte) { $hf = [int]($S.corte.Split(':')[1]) }
    if ($hf -gt $altMax) { $f += ('scale=-2:' + $altMax + ':flags=lanczos') }
  }
  return ($f -join ',')
}

# audio que o navegador toca sem converter pode ser copiado; o resto vira AAC
function Audio-Copiavel([string]$c) { return (@('aac', 'mp3', 'opus', 'flac') -contains $c) }

# o que será copiado e o que será recodificado, de acordo com o arquivo e com as opções da janela
function Estrategia() {
  $e = @{ copV = $false; copD = $false; copF = $false; motivo = '' }
  if (-not $S.arquivo -or $S.audios.Count -eq 0) { return $e }
  if (-not $chCopia.Checked) { $e.motivo = 'a cópia sem perda está desligada'; return $e }
  $okPix = (@('yuv420p', 'yuvj420p') -contains $S.pixfmt)
  $e.copV = (($S.vcodec -eq 'h264') -and $okPix)
  if (-not $e.copV) { $e.motivo = 'o vídeo é ' + $S.vcodec + ' ' + $S.pixfmt + ', que o navegador não toca' }
  $d = $cDisco.SelectedIndex
  if ($d -ge 0 -and $d -lt $S.audios.Count) { $e.copD = (Audio-Copiavel $S.audios[$d]) }
  $f = $cFita.SelectedIndex - 1
  if ($f -ge 0 -and $f -lt $S.audios.Count) { $e.copF = (Audio-Copiavel $S.audios[$f]) }
  return $e
}

function AtualizarEstrategia() {
  if ($S.carregando -or -not $S.arquivo) { return }
  try {
    $e = Estrategia
    if (-not $chCopia.Checked) {
      $lCopia.Text = 'O MP4 do site será recodificado (H.264, CRF 19, AAC 256k). Entrelaçamento, bordas e proporção valem para ele, para o celular e para a capa.'
    } elseif ($e.copV) {
      $a = if ($e.copD) { 'áudio do disco também copiado' } else { 'áudio do disco convertido para AAC 320k' }
      $lCopia.Text = 'MP4 do site: vídeo copiado sem perda (' + $S.vcodec + '), ' + $a + '. Entrelaçamento, bordas e proporção valem só para o celular e a capa.'
    } else {
      $lCopia.Text = 'Não dá para copiar: ' + $e.motivo + '. O MP4 do site será recodificado (H.264, CRF 19) com os ajustes acima.'
    }
  } catch { }
}
$chCopia.Add_CheckedChanged({ AtualizarEstrategia })
$cDisco.Add_SelectedIndexChanged({ AtualizarEstrategia })
$cFita.Add_SelectedIndexChanged({ AtualizarEstrategia })

# ---------- apoio da exportação e da conferência ----------
function Tam([double]$b) {
  if ($b -ge 1073741824) { return ('{0:0.00} GB' -f ($b / 1073741824)) }
  if ($b -ge 1048576) { return ('{0:0.0} MB' -f ($b / 1048576)) }
  return ('{0:0} KB' -f ($b / 1024))
}
function Dur([double]$t) { return ('{0}:{1:00}' -f [math]::Floor($t / 60), [math]::Floor($t % 60)) }

# taxa do arquivo de celular conforme a altura máxima
function Taxa-Celular([int]$alt) {
  if ($alt -le 360) { return @{ crf = '24'; maxrate = '700k'; buf = '1400k' } }
  if ($alt -le 480) { return @{ crf = '23'; maxrate = '1200k'; buf = '2400k' } }
  if ($alt -le 576) { return @{ crf = '23'; maxrate = '1500k'; buf = '3000k' } }
  return @{ crf = '23'; maxrate = '2500k'; buf = '5000k' }
}

# como Rodar, mas deixa a janela responder enquanto o programa trabalha (conferências demoradas)
function Rodar-Vivo([string]$exe, [string]$argumentos) {
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $exe
  $psi.Arguments = $argumentos
  $psi.UseShellExecute = $false
  $psi.CreateNoWindow = $true
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.StandardOutputEncoding = [System.Text.Encoding]::UTF8
  $psi.StandardErrorEncoding = [System.Text.Encoding]::UTF8
  $p = [System.Diagnostics.Process]::Start($psi)
  $errTask = $p.StandardError.ReadToEndAsync()
  $outTask = $p.StandardOutput.ReadToEndAsync()
  while (-not $p.HasExited) { [System.Windows.Forms.Application]::DoEvents(); Start-Sleep -Milliseconds 80 }
  $p.WaitForExit()
  return @{ out = $outTask.Result; err = $errTask.Result; code = $p.ExitCode }
}

# SHA-256 do arquivo, lendo aos poucos para a janela não travar
function Sha-Janela([string]$arq, [string]$rotulo) {
  $h = [System.Security.Cryptography.SHA256]::Create()
  $fs = New-Object System.IO.FileStream($arq, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::Read, 4194304)
  try {
    $buf = New-Object byte[] 4194304
    $total = [math]::Max(1.0, [double]$fs.Length)
    $lido = 0.0
    $ult = [DateTime]::Now
    while ($true) {
      $n = $fs.Read($buf, 0, $buf.Length)
      if ($n -le 0) { break }
      [void]$h.TransformBlock($buf, 0, $n, $null, 0)
      $lido += $n
      if (([DateTime]::Now - $ult).TotalMilliseconds -gt 250) {
        $lEtapa.Text = $rotulo + ' ' + [int](100 * $lido / $total) + '%'
        [System.Windows.Forms.Application]::DoEvents()
        $ult = [DateTime]::Now
      }
    }
    [void]$h.TransformFinalBlock($buf, 0, 0)
    return (($h.Hash | ForEach-Object { $_.ToString('x2') }) -join '')
  } finally { $fs.Dispose(); $h.Dispose() }
}

# SHA-256 dos pacotes de vídeo/áudio (o conteúdo codificado, sem o envelope): prova que a cópia não mudou nada
function Hash-Pacotes([string]$arq, [string]$maps) {
  $r = Rodar-Vivo $FFMPEG ('-v error -nostdin -i ' + (Q $arq) + ' ' + $maps + ' -c copy -f streamhash -hash sha256 -')
  $h = @{}
  foreach ($l in ($r.out -split "`r?`n")) {
    if ($l -match '^\d+,(\w),SHA256=([0-9a-fA-F]+)') { $h[$matches[1]] = $matches[2].ToLower() }
  }
  return $h
}

function Duracao-Arq([string]$arq) {
  $r = Rodar-Vivo $FFPROBE ('-v error -show_entries format=duration -of default=nw=1:nk=1 ' + (Q $arq))
  $d = 0.0
  [void][double]::TryParse(($r.out.Trim() -replace ',', '.'), [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$d)
  return $d
}

# um arquivo é escrito como .part e só vira o nome final quando o FFmpeg termina sem erro
function Novo-Passo([string]$nomeEt, [int]$peso, [string]$core, [string]$fmt, [string]$final) {
  return @{ nome = $nomeEt; peso = $peso; core = $core; fmt = $fmt; final = $final; tmp = ($final + '.part') }
}
function Finalizar-Passo($e) {
  if ($e.tmp -and [System.IO.File]::Exists($e.tmp)) {
    if ([System.IO.File]::Exists($e.final)) { [System.IO.File]::Delete($e.final) }
    [System.IO.File]::Move($e.tmp, $e.final)
  }
}
function Limpar-Passo($e) {
  try { if ($e -and $e.tmp -and [System.IO.File]::Exists($e.tmp)) { [System.IO.File]::Delete($e.tmp) } } catch { }
}

function AtualizarId() {
  $n = Slug $tNome.Text
  $lId.Text = if ($n) { "Identificador no Archive: ambario-$n" } else { '' }
  $bExp.Enabled = [bool]($S.arquivo -and $n -and -not $S.proc)
}
$tNome.Add_TextChanged({ AtualizarId })

function Previa() {
  if (-not $S.arquivo) { return }
  try {
    if (-not $S.tmpPrev) { $S.tmpPrev = Join-Path $env:TEMP ("ambario-previa-" + [guid]::NewGuid().ToString('N').Substring(0, 8) + '.jpg') }
    $pos = [math]::Max(0, [math]::Floor($S.dur / 3))
    $r = Rodar $FFMPEG ("-hide_banner -loglevel error -y -ss $pos -i " + (Q $S.arquivo) + ' -frames:v 1 -vf ' + (Q (Filtro)) + ' -q:v 4 ' + (Q $S.tmpPrev))
    if ($r.code -eq 0 -and (Test-Path $S.tmpPrev)) {
      if ($prev.Image) { $prev.Image.Dispose() }
      $bytes = [System.IO.File]::ReadAllBytes($S.tmpPrev)
      $prev.Image = [System.Drawing.Image]::FromStream((New-Object System.IO.MemoryStream(, $bytes)))
    }
  } catch { }
}
$chEntr.Add_CheckedChanged({ Previa })
$chCorte.Add_CheckedChanged({ Previa })
$cProp.Add_SelectedIndexChanged({ Previa })

function Carregar([string]$arq) {
  if ($S.proc -or $S.concluindo) { return }
  if (-not (Test-Path -LiteralPath $arq)) { return }
  $S.carregando = $true
  $form.Cursor = 'WaitCursor'
  $lEtapa.Text = 'Analisando o arquivo…'
  $form.Refresh()
  try {
    $S.arquivo = (Resolve-Path -LiteralPath $arq).Path
    $zona.Text = [System.IO.Path]::GetFileName($S.arquivo)
    $base = [System.IO.Path]::GetFileNameWithoutExtension($S.arquivo)
    $tNome.Text = Slug $base
    $tSaida.Text = Join-Path (Split-Path -Parent $S.arquivo) 'para_o_site'

    # vídeo
    $r = Rodar $FFPROBE ('-v error -select_streams v:0 -show_entries stream=width,height,field_order,codec_name,pix_fmt:format=duration -of default=nw=1 ' + (Q $S.arquivo))
    $kv = @{}
    foreach ($l in ($r.out -split "`r?`n")) { if ($l -match '^([^=]+)=(.*)$') { $kv[$matches[1]] = $matches[2] } }
    $S.larg = [int]($kv['width']); $S.alt = [int]($kv['height'])
    $S.vcodec = [string]$kv['codec_name']; $S.pixfmt = [string]$kv['pix_fmt']
    $S.tamanho = [double](Get-Item -LiteralPath $S.arquivo).Length
    $d = 0.0
    [void][double]::TryParse(($kv['duration'] -replace ',', '.'), [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$d)
    $S.dur = $d
    $ordem = if ($kv['field_order']) { $kv['field_order'] } else { 'desconhecido' }
    $min = [math]::Floor($S.dur / 60); $seg = [math]::Floor($S.dur % 60)
    $lInfo.Text = ('{0}x{1} · {2} · {3}:{4:00}' -f $S.larg, $S.alt, $kv['codec_name'], $min, $seg)

    # entrelaçamento: certo quando o arquivo diz; se não diz, só sugere tirar em tamanhos de captura de TV (480/486/576 linhas)
    $entr = $false; $motivo = ''
    if ($ordem -in @('tt', 'bb', 'tb', 'bt')) { $entr = $true; $motivo = "o arquivo diz que é entrelaçado ($ordem)" }
    elseif ($ordem -eq 'progressive') { $motivo = 'o arquivo diz que é progressivo' }
    elseif ($S.alt -in @(480, 486, 576) -and $S.larg -ge 640) { $entr = $true; $motivo = "tamanho de captura de fita ($($S.larg)x$($S.alt))" }
    else { $motivo = "parece cópia digital ($($S.larg)x$($S.alt))" }
    $chEntr.Checked = $entr
    $lEntr.Text = 'Sugestão: ' + $(if ($entr) { 'tirar' } else { 'não tirar' }) + " - $motivo"

    # faixas de áudio
    $cDisco.Items.Clear(); $cFita.Items.Clear()
    [void]$cFita.Items.Add('Nenhuma (vídeo sem o som da fita)')
    $r = Rodar $FFPROBE ('-v error -select_streams a -show_entries stream=codec_name,channels:stream_tags=title,language -of json ' + (Q $S.arquivo))
    $i = 0
    $S.audios = @()
    foreach ($st in @((ConvertFrom-Json $r.out).streams)) {
      if (-not $st) { continue }
      $i++
      $S.audios += [string]$st.codec_name
      $desc = "$i - $($st.codec_name), $($st.channels) canais"
      if ($st.tags -and $st.tags.title) { $desc += ' - ' + $st.tags.title }
      if ($st.tags -and $st.tags.language) { $desc += " ($($st.tags.language))" }
      [void]$cDisco.Items.Add($desc); [void]$cFita.Items.Add($desc)
    }
    if ($i -eq 0) { throw 'Este arquivo não tem nenhuma faixa de áudio.' }
    $cDisco.SelectedIndex = 0
    $cFita.SelectedIndex = $(if ($i -ge 2) { 2 } else { 0 })

    # bordas pretas
    $S.corte = $null
    $ini = [math]::Floor($S.dur / 4)
    $r = Rodar $FFMPEG ("-hide_banner -nostats -nostdin -ss $ini -i " + (Q $S.arquivo) + ' -t 40 -map 0:v:0 -an -sn -vf cropdetect=24:2:0 -f null -')
    $m = [regex]::Matches($r.err, 'crop=(\d+):(\d+):(\d+):(\d+)')
    if ($m.Count) {
      $u = $m[$m.Count - 1]
      $cw = [int]$u.Groups[1].Value; $ch = [int]$u.Groups[2].Value
      if (-not ($cw -eq $S.larg -and $ch -eq $S.alt) -and $cw -ge $S.larg / 2 -and $ch -ge $S.alt / 2) { $S.corte = $u.Value.Substring(5) }
    }
    $chCorte.Enabled = [bool]$S.corte
    $chCorte.Checked = [bool]$S.corte
    $lCorte.Text = if ($S.corte) { $p = $S.corte.Split(':'); "A imagem útil parece ser $($p[0])x$($p[1])" } else { 'Nenhuma borda preta encontrada' }

    $cProp.SelectedIndex = 0
    $S.carregando = $false
    AtualizarEstrategia
    Previa
    $lEtapa.Text = 'Confira as opções e clique em Exportar.'
    $log.Clear(); Log ("Arquivo: " + $S.arquivo)
  } catch {
    $S.arquivo = $null
    $lEtapa.Text = 'Não deu para ler o arquivo: ' + $_.Exception.Message
  } finally {
    $S.carregando = $false
    $form.Cursor = 'Default'
    AtualizarId
  }
}

$zona.Add_Click({
  $d = New-Object System.Windows.Forms.OpenFileDialog
  $d.Filter = 'Vídeos (*.mkv;*.mp4;*.mov;*.avi)|*.mkv;*.mp4;*.mov;*.avi|Todos os arquivos (*.*)|*.*'
  if ($d.ShowDialog() -eq 'OK') { Carregar $d.FileName }
})
$form.Add_DragEnter({ if ($_.Data.GetDataPresent([System.Windows.Forms.DataFormats]::FileDrop)) { $_.Effect = 'Copy' } })
$form.Add_DragDrop({ $f = $_.Data.GetData([System.Windows.Forms.DataFormats]::FileDrop); if ($f) { Carregar $f[0] } })
foreach ($c in @($zona, $prev)) { $c.AllowDrop = $true; $c.Add_DragEnter({ if ($_.Data.GetDataPresent([System.Windows.Forms.DataFormats]::FileDrop)) { $_.Effect = 'Copy' } }); $c.Add_DragDrop({ $f = $_.Data.GetData([System.Windows.Forms.DataFormats]::FileDrop); if ($f) { Carregar $f[0] } }) }
$bSaida.Add_Click({
  $d = New-Object System.Windows.Forms.FolderBrowserDialog
  $d.Description = 'Onde salvar os arquivos para o site'
  if ($d.ShowDialog() -eq 'OK') { $tSaida.Text = $d.SelectedPath }
})
$bAbrir.Add_Click({ $alvo = if ($S.saida) { $S.saida } else { $tSaida.Text }; if ($alvo -and (Test-Path -LiteralPath $alvo)) { Start-Process explorer.exe (Q $alvo) } })

# ---------------- exportação (uma etapa por vez, sem travar a janela) ----------------
function Travar([bool]$sim) {
  foreach ($c in @($zona, $tNome, $cDisco, $cFita, $chEntr, $chCorte, $cProp, $tSaida, $bSaida, $chCopia, $chCel, $cCel, $chMatriz)) { $c.Enabled = -not $sim }
  if (-not $sim) { $chCorte.Enabled = [bool]$S.corte; $cCel.Enabled = $chCel.Checked }
  $bCancelar.Enabled = $sim
  $bExp.Enabled = -not $sim
}

function IniciarEtapa() {
  $S.etapa++
  if ($S.etapa -ge $S.etapas.Count) { Concluir; return }
  $e = $S.etapas[$S.etapa]
  $lEtapa.Text = "[$($S.etapa + 1)/$($S.etapas.Count)] $($e.nome)…"
  Log ("→ " + $e.nome)
  $S.progresso = Join-Path $env:TEMP ("ambario-prog-" + [guid]::NewGuid().ToString('N').Substring(0, 8) + '.txt')
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $FFMPEG
  $psi.Arguments = '-hide_banner -loglevel error -nostdin -y -progress ' + (Q $S.progresso) + ' ' + $e.core + ' -f ' + $e.fmt + ' ' + (Q $e.tmp)
  $psi.UseShellExecute = $false; $psi.CreateNoWindow = $true; $psi.RedirectStandardError = $true
  $psi.StandardErrorEncoding = [System.Text.Encoding]::UTF8
  $S.proc = [System.Diagnostics.Process]::Start($psi)
  $S.errTask = $S.proc.StandardError.ReadToEndAsync()
  $relogio.Start()
}

$relogio = New-Object System.Windows.Forms.Timer
$relogio.Interval = 400
$relogio.Add_Tick({
  if (-not $S.proc) { $relogio.Stop(); return }
  $e = $S.etapas[$S.etapa]
  # progresso da etapa (out_time_us / out_time_ms do ffmpeg -progress; os dois em microssegundos)
  try {
    if ($e.peso -gt 0 -and (Test-Path $S.progresso) -and $S.dur -gt 0) {
      $fs = New-Object System.IO.FileStream($S.progresso, 'Open', 'Read', 'ReadWrite')
      $sr = New-Object System.IO.StreamReader($fs)
      $txt = $sr.ReadToEnd(); $sr.Close()
      $m = [regex]::Matches($txt, 'out_time_(?:us|ms)=(\d+)')
      if ($m.Count) {
        $f = [math]::Min(1, [double]$m[$m.Count - 1].Groups[1].Value / 1e6 / $S.dur)
        $antes = 0; $total = 0
        for ($k = 0; $k -lt $S.etapas.Count; $k++) { $total += $S.etapas[$k].peso; if ($k -lt $S.etapa) { $antes += $S.etapas[$k].peso } }
        $barra.Value = [int](1000 * ($antes + $f * $e.peso) / $total)
        $seg = ((Get-Date) - $S.inicio).TotalSeconds
        $lEtapa.Text = "[$($S.etapa + 1)/$($S.etapas.Count)] $($e.nome)… $([int]($f * 100))%   (tempo: $([int]($seg / 60))min $([int]($seg % 60))s)"
      }
    }
  } catch { }
  if ($S.proc.HasExited) {
    $relogio.Stop()
    $codigo = $S.proc.ExitCode
    $err = $S.errTask.Result
    $S.proc = $null
    Remove-Item $S.progresso -ErrorAction SilentlyContinue
    if ($S.cancelado) { Limpar-Passo $e; $lEtapa.Text = 'Cancelado.'; Log 'Cancelado (nenhum arquivo incompleto ficou para trás).'; $barra.Value = 0; Travar $false; AtualizarId; return }
    if ($codigo -ne 0) {
      Limpar-Passo $e
      Log $err
      $lEtapa.Text = 'Algo deu errado no FFmpeg (veja a mensagem abaixo). Nada foi apagado.'
      $barra.Value = 0; Travar $false; AtualizarId; return
    }
    Finalizar-Passo $e
    IniciarEtapa
  }
})

$bCancelar.Add_Click({ if ($S.proc -and -not $S.proc.HasExited) { $S.cancelado = $true; try { $S.proc.Kill() } catch { } } })

$bExp.Add_Click({
  $nome = Slug $tNome.Text
  if (-not $S.arquivo -or -not $nome) { return }
  $raiz = $tSaida.Text.Trim()
  if (-not $raiz) { return }
  $dest = Join-Path $raiz $nome
  $fMp4 = Join-Path $dest "$nome.mp4"
  $fFita = Join-Path $dest "$nome-fita.m4a"
  $fCel = Join-Path $dest "$($nome)_celular.mp4"
  $ja = @()
  foreach ($x in @($fMp4, $fFita, $fCel)) { if (Test-Path -LiteralPath $x) { $ja += [System.IO.Path]::GetFileName($x) } }
  if ($ja.Count -gt 0) {
    $msg = 'Já existem nesta pasta: ' + ($ja -join ', ') + "`n`nSubstituir? (os antigos só são trocados quando os novos ficarem prontos)"
    if ([System.Windows.Forms.MessageBox]::Show($msg, 'Ambário', 'YesNo', 'Question') -ne 'Yes') { return }
  }
  [void][System.IO.Directory]::CreateDirectory($dest)
  Get-ChildItem -LiteralPath $dest -Filter '*.part' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
  $S.nome = $nome; $S.saida = $dest

  $e = Estrategia
  $S.estr = $e
  $pri = $cDisco.SelectedIndex
  $fita = $cFita.SelectedIndex - 1
  $S.pri = $pri; $S.fitaIdx = $fita
  $altMob = [int](([string]$cCel.SelectedItem) -replace '[^0-9]', '')
  if ($altMob -le 0) { $altMob = 480 }
  $S.o = @{ entr = $chEntr.Checked; corte = $(if ($chCorte.Checked) { $S.corte } else { $null }); ar = $cProp.SelectedIndex; mobile = $chCel.Checked; altMob = $altMob; matriz = $chMatriz.Checked }
  $entrada = Q $S.arquivo
  $leaf = Q ([System.IO.Path]::GetFileName($S.arquivo))
  $etapas = @()
  $cmds = @()

  # 1. MP4 do site
  if ($e.copV) {
    $core = "-i $entrada -map 0:v:0 -map 0:a:$pri -c:v copy " + $(if ($e.copD) { '-c:a copy' } else { '-c:a aac -b:a 320k' }) + ' -movflags +faststart'
    $etapas += Novo-Passo "Imagem + áudio do disco ($nome.mp4) - cópia sem perda" 1 $core 'mp4' $fMp4
  } else {
    $vf = Filtro 'send_field' 0
    $core = "-i $entrada -map 0:v:0 -map 0:a:$pri -vf " + (Q $vf) + ' -c:v libx264 -preset slow -crf 19 -maxrate 3500k -bufsize 7000k -g 120 -keyint_min 24 -profile:v high -level 4.1 -pix_fmt yuv420p -af "aresample=async=1:first_pts=0" -c:a aac -b:a 256k -movflags +faststart -map_metadata -1 -map_chapters -1'
    $etapas += Novo-Passo "Imagem + áudio do disco ($nome.mp4) - recodificando" 10 $core 'mp4' $fMp4
  }
  $cmds += ('ffmpeg ' + $core.Replace($entrada, $leaf) + ' ' + (Q "$nome.mp4"))

  # 2. som da fita
  if ($fita -ge 0) {
    $core = "-i $entrada -map 0:a:$fita -vn " + $(if ($e.copF) { '-c:a copy' } else { '-c:a aac -b:a 256k' }) + ' -movflags +faststart'
    $etapas += Novo-Passo ("Som original da fita ($nome-fita.m4a)" + $(if ($e.copF) { ' - cópia sem perda' } else { ' - convertendo para AAC' })) 1 $core 'mp4' $fFita
    $cmds += ('ffmpeg ' + $core.Replace($entrada, $leaf) + ' ' + (Q "$nome-fita.m4a"))
  }

  # 3. versão leve para celular
  if ($chCel.Checked) {
    $tx = Taxa-Celular $altMob
    $vfc = Filtro 'send_frame' $altMob
    $core = "-i $entrada -map 0:v:0 -map 0:a:$pri -vf " + (Q $vfc) + ' -c:v libx264 -preset slow -crf ' + $tx.crf + ' -maxrate ' + $tx.maxrate + ' -bufsize ' + $tx.buf + ' -profile:v main -pix_fmt yuv420p -g 60 -af "aresample=async=1:first_pts=0" -c:a aac -b:a 128k -ac 2 -movflags +faststart -map_metadata -1 -map_chapters -1'
    $etapas += Novo-Passo "Versão leve para celular ($($nome)_celular.mp4)" 6 $core 'mp4' $fCel
    $cmds += ('ffmpeg ' + $core.Replace($entrada, $leaf) + ' ' + (Q "$($nome)_celular.mp4"))
  }

  # espaço em disco
  try {
    $livre = [double](New-Object System.IO.DriveInfo([System.IO.Path]::GetPathRoot($dest))).AvailableFreeSpace
    $precisa = $(if ($e.copV) { $S.tamanho * 1.05 } else { $S.tamanho * 0.6 }) + 31457280
    if ($chCel.Checked) { $precisa += $S.dur * 200000 }
    if ($livre -lt $precisa) {
      $msg = 'Pouco espaço livre: ' + (Tam $livre) + ' livres e a exportação precisa de uns ' + (Tam $precisa) + ".`n`nContinuar mesmo assim?"
      if ([System.Windows.Forms.MessageBox]::Show($msg, 'Ambário', 'YesNo', 'Warning') -ne 'Yes') { return }
    }
  } catch { }

  $S.etapas = $etapas
  $S.cmds = $cmds
  $S.etapa = -1; $S.cancelado = $false; $S.inicio = Get-Date
  $barra.Value = 0
  $bAbrir.Enabled = $false
  Log ''
  Log "Exportando: $nome   (pasta: $dest)"
  Log ('MP4 do site: ' + $(if ($e.copV) { 'cópia sem perda' } else { 'recodificado' }) + '   |   celular: ' + $(if ($chCel.Checked) { "até ${altMob}p" } else { 'não' }))
  foreach ($cm in $cmds) { Log ('  ' + $cm) }
  Travar $true
  IniciarEtapa
})

function Concluir() {
  $S.concluindo = $true
  $barra.Value = 1000
  $form.Cursor = 'WaitCursor'
  Travar $true
  $bCancelar.Enabled = $false
  $nome = $S.nome; $dest = $S.saida; $e = $S.estr; $o = $S.o
  $arq = $S.arquivo; $pri = $S.pri; $fita = $S.fitaIdx
  $fMp4 = Join-Path $dest "$nome.mp4"
  $fFita = Join-Path $dest "$nome-fita.m4a"
  $fCel = Join-Path $dest "$($nome)_celular.mp4"
  $fMkv = Join-Path $dest "$nome.mkv"
  $verif = New-Object System.Collections.ArrayList
  $avisos = New-Object System.Collections.ArrayList
  try {
    # ----- conferência automática -----
    $lEtapa.Text = 'Conferindo os arquivos…'
    if ((Test-Path -LiteralPath $fMp4) -and $e.copV) {
      $lEtapa.Text = 'Conferindo o MP4 contra a matriz (SHA-256 dos pacotes)…'
      if ($e.copD) {
        $h1 = Hash-Pacotes $arq ('-map 0:v:0 -map 0:a:' + $pri)
        $h2 = Hash-Pacotes $fMp4 '-map 0:v:0 -map 0:a:0'
        $igual = ($h1['v'] -and $h1['v'] -eq $h2['v'] -and $h1['a'] -and $h1['a'] -eq $h2['a'])
        $txt = 'MP4: pacotes de vídeo e de áudio idênticos aos da matriz (SHA-256 de cada fluxo).'
      } else {
        $h1 = Hash-Pacotes $arq '-map 0:v:0'
        $h2 = Hash-Pacotes $fMp4 '-map 0:v:0'
        $igual = ($h1['v'] -and $h1['v'] -eq $h2['v'])
        $txt = 'MP4: pacotes de vídeo idênticos aos da matriz (SHA-256). O áudio foi convertido para AAC.'
      }
      if ($igual) { [void]$verif.Add('OK   ' + $txt) } else { [void]$verif.Add('ATENCAO MP4: os pacotes não batem byte a byte com a matriz. Guarde o MKV e confira o MP4.'); [void]$avisos.Add('MP4: os pacotes não batem com a matriz.') }
    }
    if ((Test-Path -LiteralPath $fFita) -and $e.copF) {
      $h1 = Hash-Pacotes $arq ('-map 0:a:' + $fita)
      $h2 = Hash-Pacotes $fFita '-map 0:a:0'
      if ($h1['a'] -and $h1['a'] -eq $h2['a']) { [void]$verif.Add('OK   M4A: pacotes de áudio idênticos aos da matriz (SHA-256).') } else { [void]$verif.Add('ATENCAO M4A: os pacotes não batem byte a byte com a matriz.'); [void]$avisos.Add('M4A: os pacotes não batem com a matriz.') }
    }
    foreach ($par in @(@('MP4', $fMp4), @('M4A', $fFita), @('Celular', $fCel))) {
      if (Test-Path -LiteralPath $par[1]) {
        $dm = Duracao-Arq $par[1]
        if ([math]::Abs($dm - $S.dur) -le 1.5) { [void]$verif.Add('OK   ' + $par[0] + ': duração ' + (Dur $dm) + ' (matriz ' + (Dur $S.dur) + ').') }
        else { [void]$verif.Add('ATENCAO ' + $par[0] + ': duração ' + (Dur $dm) + ' diferente da matriz (' + (Dur $S.dur) + ').'); [void]$avisos.Add($par[0] + ': duração diferente da matriz.') }
      }
    }
    if (Test-Path -LiteralPath $fCel) {
      $lEtapa.Text = 'Conferindo se o arquivo de celular lê do começo ao fim…'
      $dc = Rodar-Vivo $FFMPEG ('-v error -nostdin -i ' + (Q $fCel) + ' -f null -')
      if ($dc.code -eq 0 -and -not $dc.err.Trim()) { [void]$verif.Add('OK   Celular: o arquivo lê do começo ao fim sem nenhum erro.') }
      else { [void]$verif.Add('ATENCAO Celular: o FFmpeg reclamou ao ler o arquivo de ponta a ponta.'); [void]$avisos.Add('Celular: o FFmpeg reclamou ao ler o arquivo. Exporte de novo.') }
    }

    # ----- o original (MKV) na pasta de envio: atalho de disco, não gasta espaço -----
    $matriz = 'nao'
    if ($o.matriz) {
      if (Test-Path -LiteralPath $fMkv) { $matriz = 'existe' }
      else {
        $lEtapa.Text = 'Pondo o original na pasta…'
        $r = Rodar-Vivo 'cmd.exe' ('/c mklink /H ' + (Q $fMkv) + ' ' + (Q $arq))
        if ($r.code -eq 0 -and (Test-Path -LiteralPath $fMkv)) { $matriz = 'atalho' }
        else {
          $msg = "Não deu para criar o atalho do MKV (disco exFAT/FAT ou outra unidade).`n`nCopiar o MKV para a pasta? (gasta espaço)"
          if ([System.Windows.Forms.MessageBox]::Show($msg, 'Ambário', 'YesNo', 'Question') -eq 'Yes') {
            $lEtapa.Text = 'Copiando o MKV…'
            [System.Windows.Forms.Application]::DoEvents()
            [System.IO.File]::Copy($arq, $fMkv)
            $matriz = 'copia'
          }
        }
      }
      if ($matriz -eq 'copia') {
        $shaMkv = Sha-Janela $arq 'SHA-256 do original (pode levar alguns minutos)'
        if ((Sha-Janela $fMkv 'Conferindo a cópia do MKV') -ne $shaMkv) {
          [System.IO.File]::Delete($fMkv); $matriz = 'nao'
          [void]$avisos.Add('A cópia do MKV não bateu com o original e foi descartada. Envie o MKV original direto.')
        } else { [void]$verif.Add('OK   MKV: cópia na pasta conferida (SHA-256 igual ao original).') }
      }
    }

    # ----- resumo -----
    $seg2 = ((Get-Date) - $S.inicio).TotalSeconds
    $lEtapa.Text = ('Pronto em {0}min {1}s!  Identificador sugerido no Archive: ambario-{2}' -f [int][math]::Floor($seg2 / 60), [int]($seg2 % 60), $nome)
    Log ''
    Log 'Pronto! Arquivos na pasta:'
    foreach ($arqSaida in @($fMkv, $fMp4, $fFita, $fCel)) {
      if (Test-Path -LiteralPath $arqSaida) { Log ('  ' + [System.IO.Path]::GetFileName($arqSaida) + '   ' + (Tam ([double](Get-Item -LiteralPath $arqSaida).Length))) }
    }
    foreach ($v in $verif) { Log ('  ' + $v) }
    foreach ($w in $avisos) { Log ('  [!] ' + $w) }
    Log ('Pasta: ' + $dest)
    $bAbrir.Enabled = $true
    [System.Media.SystemSounds]::Asterisk.Play()
  } catch {
    $lEtapa.Text = 'Os arquivos foram gerados, mas a conferência falhou: ' + $_.Exception.Message
    Log $lEtapa.Text
    $bAbrir.Enabled = $true
  } finally {
    $S.concluindo = $false
    $form.Cursor = 'Default'
    Travar $false
    AtualizarId
  }
}

$form.Add_FormClosing({
  if ($S.concluindo) { [System.Windows.Forms.MessageBox]::Show('Aguarde um instante: os arquivos ainda estão sendo conferidos.', 'Ambário', 'OK', 'Information') | Out-Null; $_.Cancel = $true; return }
  if ($S.proc -and -not $S.proc.HasExited) {
    if ([System.Windows.Forms.MessageBox]::Show('A exportação ainda está rodando. Cancelar e fechar?', 'Ambário', 'YesNo', 'Warning') -ne 'Yes') { $_.Cancel = $true; return }
    $S.cancelado = $true; try { $S.proc.Kill() } catch { }
  }
  if ($S.tmpPrev) { Remove-Item $S.tmpPrev -ErrorAction SilentlyContinue }
})

# arquivo arrastado para cima do .bat
$arg0 = if ($args.Count -gt 0 -and $args[0]) { [string]$args[0] } else { $null }
if ($arg0) { $form.Add_Shown({ Carregar $arg0 }) }

[void]$form.ShowDialog()
