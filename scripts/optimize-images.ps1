param([string]$Root = (Split-Path -Parent $PSScriptRoot))
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$catalogue = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $Root 'data/catalogue.json') | ConvertFrom-Json
$destination = Join-Path $Root 'images/optimized'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
$manifest = [ordered]@{}
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
foreach ($item in $catalogue) {
  for ($index = 0; $index -lt $item.photos.Count; $index++) {
    $photo = $item.photos[$index]
    if ($manifest.Contains($photo)) { continue }
    $source = [System.Drawing.Image]::FromFile((Join-Path $Root $photo))
    try {
      $variants = @()
      foreach ($maxSide in @(600,1200)) {
        $scale = [Math]::Min(1.0, $maxSide / [double][Math]::Max($source.Width,$source.Height))
        $width = [Math]::Max(1,[int][Math]::Round($source.Width*$scale))
        $height = [Math]::Max(1,[int][Math]::Round($source.Height*$scale))
        $name = "$($item.id)-$($index+1)-$maxSide.jpg"
        $target = Join-Path $destination $name
        $bitmap = New-Object System.Drawing.Bitmap($width,$height)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
          $graphics.Clear([System.Drawing.Color]::White)
          $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
          $graphics.DrawImage($source,0,0,$width,$height)
          $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
          $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,([long]85))
          try { $bitmap.Save($target,$encoder,$parameters) } finally { $parameters.Dispose() }
        } finally { $graphics.Dispose(); $bitmap.Dispose() }
        $variants += [ordered]@{path="images/optimized/$name";width=$width;height=$height;bytes=(Get-Item -LiteralPath $target).Length}
      }
      $manifest[$photo] = [ordered]@{width=$source.Width;height=$source.Height;variants=$variants}
    } finally { $source.Dispose() }
  }
}
$json = $manifest | ConvertTo-Json -Depth 8
[System.IO.File]::WriteAllText((Join-Path $Root 'data/image-manifest.json'),$json+[Environment]::NewLine,(New-Object System.Text.UTF8Encoding($false)))
Write-Output "Generated optimized derivatives for $($manifest.Count) original photographs."
