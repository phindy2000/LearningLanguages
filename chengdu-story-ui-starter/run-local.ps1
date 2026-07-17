$root = $PSScriptRoot
Start-Process python -ArgumentList "-m", "http.server", "8080" -WorkingDirectory $root
Start-Sleep -Seconds 1
Start-Process "http://localhost:8080"
