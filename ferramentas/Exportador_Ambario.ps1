# ======================================================================
#  Ambário — Exportador para o site (versão com janela)
#
#  Faz o mesmo que o Exportar_para_o_site.bat, numa janela:
#  arraste o MKV do EternalDub (faixa 1 = disco, faixa 2 = fita), confira
#  as opções e clique em Exportar. Saem numa pasta "para_o_site":
#    NOME.mp4       imagem + áudio do disco (H.264 + AAC, bitrate limitado)
#    NOME-fita.m4a  som original da fita
#    NOME.jpg       capa
#    NOME-info.txt  duração, tamanho e próximos passos
#  Para abrir: dois cliques em "Exportador_Ambario.bat" (ao lado deste arquivo).
#  Precisa do FFmpeg (o mesmo do EternalDub): no PATH, ao lado deste arquivo,
#  ou instalado com: winget install Gyan.FFmpeg
# ======================================================================

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$ErrorActionPreference = 'Stop'
$Pasta = Split-Path -Parent $MyInvocation.MyCommand.Path

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
  [System.Windows.Forms.MessageBox]::Show("Não encontrei o FFmpeg.`n`nInstale com:  winget install Gyan.FFmpeg`nou coloque ffmpeg.exe e ffprobe.exe na mesma pasta deste programa.", 'Ambário — Exportador', 'OK', 'Error') | Out-Null
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
$form.Text = 'Ambário — Exportar para o site'
$form.Size = New-Object System.Drawing.Size(780, 690)
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

Rotulo 'Salvar em' 16 340 150 $true | Out-Null
$tSaida = New-Object System.Windows.Forms.TextBox
$tSaida.Location = New-Object System.Drawing.Point(170, 337); $tSaida.Size = New-Object System.Drawing.Size(486, 24)
$form.Controls.Add($tSaida)
$bSaida = New-Object System.Windows.Forms.Button
$bSaida.Text = 'Escolher…'; $bSaida.Location = New-Object System.Drawing.Point(662, 336); $bSaida.Size = New-Object System.Drawing.Size(84, 26)
$form.Controls.Add($bSaida)

# 3. exportar
$bExp = New-Object System.Windows.Forms.Button
$bExp.Text = 'Exportar'
$bExp.Font = New-Object System.Drawing.Font('Segoe UI', 11, [System.Drawing.FontStyle]::Bold)
$bExp.BackColor = [System.Drawing.Color]::FromArgb(255, 214, 64)
$bExp.FlatStyle = 'Flat'
$bExp.Location = New-Object System.Drawing.Point(16, 378); $bExp.Size = New-Object System.Drawing.Size(160, 40)
$bExp.Enabled = $false
$form.Controls.Add($bExp)
$bCancelar = New-Object System.Windows.Forms.Button
$bCancelar.Text = 'Cancelar'; $bCancelar.Location = New-Object System.Drawing.Point(184, 378); $bCancelar.Size = New-Object System.Drawing.Size(90, 40)
$bCancelar.Enabled = $false
$form.Controls.Add($bCancelar)
$bAbrir = New-Object System.Windows.Forms.Button
$bAbrir.Text = 'Abrir a pasta'; $bAbrir.Location = New-Object System.Drawing.Point(282, 378); $bAbrir.Size = New-Object System.Drawing.Size(110, 40)
$bAbrir.Enabled = $false
$form.Controls.Add($bAbrir)

$barra = New-Object System.Windows.Forms.ProgressBar
$barra.Location = New-Object System.Drawing.Point(16, 428); $barra.Size = New-Object System.Drawing.Size(730, 18); $barra.Maximum = 1000
$form.Controls.Add($barra)
$lEtapa = Rotulo 'Escolha um arquivo para começar.' 16 450 730

$log = New-Object System.Windows.Forms.TextBox
$log.Multiline = $true; $log.ReadOnly = $true; $log.ScrollBars = 'Vertical'
$log.Font = New-Object System.Drawing.Font('Consolas', 9)
$log.Location = New-Object System.Drawing.Point(16, 476); $log.Size = New-Object System.Drawing.Size(730, 156)
$log.Anchor = 'Top, Bottom, Left, Right'
$form.Controls.Add($log)
function Log([string]$t) { $log.AppendText($t + "`r`n") }

# ---------------- estado ----------------
$S = @{ arquivo = $null; dur = 0.0; larg = 0; alt = 0; corte = $null; proc = $null; etapas = @(); etapa = -1; progresso = $null; inicio = $null; tmpPrev = $null }

function Filtro() {
  $f = @()
  if ($chEntr.Checked) { $f += 'bwdif=mode=send_field:deint=all' }
  if ($chCorte.Checked -and $S.corte) { $f += "crop=$($S.corte)" }
  switch ($cProp.SelectedIndex) {
    1 { $f += 'scale=trunc(ih*4/3/2)*2:trunc(ih/2)*2:flags=lanczos,setsar=1' }
    2 { $f += 'scale=trunc(ih*16/9/2)*2:trunc(ih/2)*2:flags=lanczos,setsar=1' }
    default { $f += 'scale=trunc(iw*sar/2)*2:trunc(ih/2)*2:flags=lanczos,setsar=1' }
  }
  return ($f -join ',')
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
  if ($S.proc) { return }
  if (-not (Test-Path -LiteralPath $arq)) { return }
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
    $r = Rodar $FFPROBE ('-v error -select_streams v:0 -show_entries stream=width,height,field_order,codec_name:format=duration -of default=nw=1 ' + (Q $S.arquivo))
    $kv = @{}
    foreach ($l in ($r.out -split "`r?`n")) { if ($l -match '^([^=]+)=(.*)$') { $kv[$matches[1]] = $matches[2] } }
    $S.larg = [int]($kv['width']); $S.alt = [int]($kv['height'])
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
    $lEntr.Text = 'Sugestão: ' + $(if ($entr) { 'tirar' } else { 'não tirar' }) + " — $motivo"

    # faixas de áudio
    $cDisco.Items.Clear(); $cFita.Items.Clear()
    [void]$cFita.Items.Add('Nenhuma (vídeo sem o som da fita)')
    $r = Rodar $FFPROBE ('-v error -select_streams a -show_entries stream=codec_name,channels:stream_tags=title,language -of json ' + (Q $S.arquivo))
    $i = 0
    foreach ($st in @((ConvertFrom-Json $r.out).streams)) {
      if (-not $st) { continue }
      $i++
      $desc = "$i — $($st.codec_name), $($st.channels) canais"
      if ($st.tags -and $st.tags.title) { $desc += ' — ' + $st.tags.title }
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
    Previa
    $lEtapa.Text = 'Confira as opções e clique em Exportar.'
    $log.Clear(); Log ("Arquivo: " + $S.arquivo)
  } catch {
    $S.arquivo = $null
    $lEtapa.Text = 'Não deu para ler o arquivo: ' + $_.Exception.Message
  } finally {
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
$bAbrir.Add_Click({ if (Test-Path $tSaida.Text) { Start-Process explorer.exe (Q $tSaida.Text) } })

# ---------------- exportação (uma etapa por vez, sem travar a janela) ----------------
function Travar([bool]$sim) {
  foreach ($c in @($zona, $tNome, $cDisco, $cFita, $chEntr, $chCorte, $cProp, $tSaida, $bSaida)) { $c.Enabled = -not $sim }
  if (-not $sim) { $chCorte.Enabled = [bool]$S.corte }
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
  $psi.Arguments = '-hide_banner -loglevel error -nostdin -y -progress ' + (Q $S.progresso) + ' ' + $e.args
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
    if ($S.cancelado) { $lEtapa.Text = 'Cancelado.'; Log 'Cancelado.'; $barra.Value = 0; Travar $false; AtualizarId; return }
    if ($codigo -ne 0) {
      Log $err
      $lEtapa.Text = 'Algo deu errado no FFmpeg (veja a mensagem abaixo). Nada foi apagado.'
      $barra.Value = 0; Travar $false; AtualizarId; return
    }
    IniciarEtapa
  }
})

$bCancelar.Add_Click({ if ($S.proc -and -not $S.proc.HasExited) { $S.cancelado = $true; try { $S.proc.Kill() } catch { } } })

$bExp.Add_Click({
  $nome = Slug $tNome.Text
  if (-not $S.arquivo -or -not $nome) { return }
  $saida = $tSaida.Text.Trim()
  if (-not $saida) { return }
  if (-not (Test-Path $saida)) { New-Item -ItemType Directory -Path $saida | Out-Null }
  $S.nome = $nome; $S.saida = $saida
  $mp4 = Join-Path $saida "$nome.mp4"
  if ((Test-Path $mp4) -and [System.Windows.Forms.MessageBox]::Show("Já existe $nome.mp4 nessa pasta. Substituir?", 'Ambário', 'YesNo', 'Question') -ne 'Yes') { return }
  $vf = Filtro
  $pri = $cDisco.SelectedIndex
  $fita = $cFita.SelectedIndex - 1
  $entrada = Q $S.arquivo
  $S.etapas = @(
    @{ nome = "Imagem + áudio do disco ($nome.mp4)"; peso = 10; args = "-i $entrada -map 0:v:0 -map 0:a:$pri -vf " + (Q $vf) + ' -c:v libx264 -preset slow -crf 19 -maxrate 3500k -bufsize 7000k -g 120 -keyint_min 24 -profile:v high -level 4.1 -pix_fmt yuv420p -af "aresample=async=1:first_pts=0" -c:a aac -b:a 256k -movflags +faststart -map_metadata -1 -map_chapters -1 ' + (Q $mp4) }
  )
  if ($fita -ge 0) {
    $S.etapas += @{ nome = "Som original da fita ($nome-fita.m4a)"; peso = 1; args = "-i $entrada -map 0:a:$fita -vn -af " + (Q 'aresample=async=1:first_pts=0') + ' -c:a aac -b:a 160k -movflags +faststart -map_metadata -1 ' + (Q (Join-Path $saida "$nome-fita.m4a")) }
  }
  $pos = [math]::Max(0, [math]::Floor($S.dur / 3))
  $S.etapas += @{ nome = "Capa ($nome.jpg)"; peso = 0; args = "-ss $pos -i $entrada -frames:v 1 -vf " + (Q $vf) + ' -q:v 3 ' + (Q (Join-Path $saida "$nome.jpg")) }
  $S.etapa = -1; $S.cancelado = $false; $S.inicio = Get-Date
  $barra.Value = 0
  $bAbrir.Enabled = $false
  Log ''
  Log "Exportando: $nome   (filtro: $vf)"
  Travar $true
  IniciarEtapa
})

function Concluir() {
  $barra.Value = 1000
  Travar $false; AtualizarId
  $nome = $S.nome; $saida = $S.saida
  $mp4 = Join-Path $saida "$nome.mp4"
  $tam = ''
  $r = Rodar $FFPROBE ('-v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 ' + (Q $mp4))
  $tam = $r.out.Trim()
  $mb = [math]::Round((Get-Item $mp4).Length / 1MB, 1)
  $kbps = if ($S.dur -gt 0) { [int]((Get-Item $mp4).Length * 8 / 1000 / $S.dur) } else { 0 }
  $min = [math]::Floor($S.dur / 60); $seg = [math]::Floor($S.dur % 60)
  $fitaOk = Test-Path (Join-Path $saida "$nome-fita.m4a")
  $info = @(
    "Ambario - $nome",
    ('Duracao: {0}:{1:00}   Imagem final: {2}   MP4: {3} MB (~{4} kbps)' -f $min, $seg, $tam, $mb, $kbps),
    "Arquivos: $nome.mp4 / $nome.jpg" + $(if ($fitaOk) { " / $nome-fita.m4a" } else { '' }),
    '',
    'Proximos passos:',
    '1. archive.org/upload - envie o MP4, o JPG e o M4A (e, se quiser, o MKV original como matriz).',
    "   Identificador sugerido: ambario-$nome",
    '   Assunto/tags: ambario; videoclipe; VHS. Tipo de midia: Movies.',
    '   (Para trocar um video que ja esta no site: envie o MP4 novo, com o mesmo nome, no mesmo item.)',
    '2. No site, abra a area do curador: endereco do site + #admin',
    '   Abra o video (ou + Novo video), cole o identificador em "Item do Internet Archive"',
    '   e clique em Importar arquivos. Confira e clique em Salvar e publicar.'
  )
  [System.IO.File]::WriteAllLines((Join-Path $saida "$nome-info.txt"), $info, (New-Object System.Text.UTF8Encoding($false)))
  $seg2 = ((Get-Date) - $S.inicio).TotalSeconds
  $lEtapa.Text = ('Pronto em {0}min {1}s!  {2} — {3} MB (~{4} kbps). Identificador: ambario-{5}' -f [int]($seg2 / 60), [int]($seg2 % 60), $tam, $mb, $kbps, $nome)
  Log ("Pronto! " + $info[1])
  Log ("Pasta: " + $saida)
  $bAbrir.Enabled = $true
  [System.Media.SystemSounds]::Asterisk.Play()
}

$form.Add_FormClosing({
  if ($S.proc -and -not $S.proc.HasExited) {
    if ([System.Windows.Forms.MessageBox]::Show('A exportação ainda está rodando. Cancelar e fechar?', 'Ambário', 'YesNo', 'Warning') -ne 'Yes') { $_.Cancel = $true; return }
    $S.cancelado = $true; try { $S.proc.Kill() } catch { }
  }
  if ($S.tmpPrev) { Remove-Item $S.tmpPrev -ErrorAction SilentlyContinue }
})

# arquivo arrastado para cima do .bat
$arg0 = if ($args.Count -gt 0) { $args[0] } else { $null }
if ($arg0) { $form.Add_Shown({ Carregar $arg0 }) }

[void]$form.ShowDialog()
