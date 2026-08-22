# Serves this folder at http://localhost:8080/ so the app can be tested locally, with the
# service worker and PWA install behavior working exactly as they do on GitHub Pages (both
# require http(s)/localhost — a plain file:// double-click can't do this).
# No installs needed. Run with:  powershell -ExecutionPolicy Bypass -File serve-local.ps1
$root = $PSScriptRoot
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving '$root' at http://localhost:$port/  (Ctrl+C to stop)"
Start-Process "http://localhost:$port/"

$mime = @{
  '.html' = 'text/html'; '.js' = 'application/javascript'; '.css' = 'text/css';
  '.json' = 'application/json'; '.webmanifest' = 'application/manifest+json';
  '.png' = 'image/png'; '.svg' = 'image/svg+xml'; '.ico' = 'image/x-icon'; '.md' = 'text/plain';
}

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $req = $context.Request
  $res = $context.Response
  try {
    $path = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)
    if ($path -eq '/') { $path = '/index.html' }
    $filePath = Join-Path $root ($path.TrimStart('/'))
    if (Test-Path $filePath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($filePath)
      $ct = $mime[$ext]
      if (-not $ct) { $ct = 'application/octet-stream' }
      $res.ContentType = $ct
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $res.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
      $res.OutputStream.Write($msg, 0, $msg.Length)
    }
  } catch {
    $res.StatusCode = 500
  } finally {
    $res.OutputStream.Close()
  }
}
