# Run in PowerShell from C:\Projects\kinfold after copying apps-script HTML from the PR.
$ErrorActionPreference = "Stop"
$src = $args[0]
if (-not $src) { Write-Host "Usage: .\deploy.ps1 <path-to-kinfold-admin>\apps-script"; exit 1 }

Copy-Item "$src\InboundLog.html" . -Force -ErrorAction SilentlyContinue
Copy-Item "$src\InvoiceHub.html" . -Force
Copy-Item "$src\InvoiceArchive.html" . -Force
Copy-Item "$src\QuestionsReview.html" . -Force
Copy-Item "$src\DraughtPricing.html" . -Force
Copy-Item "$src\Products.html" . -Force
Copy-Item "$src\PriceReview.html" . -Force -ErrorAction SilentlyContinue
# If your live file is Pricing.html:
if (Test-Path .\Pricing.html) { Copy-Item "$src\PriceReview.html" .\Pricing.html -Force }
Copy-Item "$src\Sidebar.html" . -Force -ErrorAction SilentlyContinue

Write-Host "Files copied. Review Code.patches.js manually into Code.js (doGet archive + inbound invoiceId)."
clasp login --status
clasp push
clasp deploy -d "invoicing+pricing fixes $(Get-Date -Format o)"
clasp deployments
Write-Host "Done. Hard-refresh https://owner.kinfoldinns.co.uk and https://admin.kinfoldinns.co.uk"
