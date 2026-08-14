# Kinfold invoicing fixes (Apps Script + clasp)

Cloud agent could not access private `charlesknew-alt/kinfold-invoicing` or clasp credentials, so the fixed sources live here for you to copy into `C:\Projects\kinfold` and `clasp push`.

## What’s fixed

| # | Change | Files |
|---|--------|--------|
| 1 | **Inbound Delete** on Processed rows via `deleteInvoiceById` (confirm explains invoice + lines + questions removed; other pub copies & Product Master learning stay) | `InboundLog.html`, `Code.patches.js` (`invoiceId` / `deleteInvoiceByInboundRef`) |
| 2 | **`?page=archive`** serves real Archive UI + `getInvoiceArchive` (not Failed Invoices) | `InvoiceArchive.html`, `Code.patches.js` (`doGet` archive case) |
| 3 | **Invoice Hub** restyled (Assistant/Questions light+teal) + client 55s timeout so Loading can’t hang forever | `InvoiceHub.html`, `Code.patches.js` (`getInvoiceHubData` notes) |
| 4 | **Questions pub dropdown** → `reassignInvoiceToPub` | `QuestionsReview.html` |
| 5 | **Draught Pricing** pack→pint repair: empty Saleable + £/pt === Cost £ made @GP/@Cash/Blended nonsense (£100+/pt). Client recomputes saleable pints + pillars from pack size | `DraughtPricing.html` (`?page=draughtpricing`) |

## Apply (on your PC)

```powershell
cd C:\Projects\kinfold

# Copy fixed HTML over the clasp project files
copy <path-to-this-repo>\apps-script\InboundLog.html .
copy <path-to-this-repo>\apps-script\InvoiceHub.html .
copy <path-to-this-repo>\apps-script\InvoiceArchive.html .
copy <path-to-this-repo>\apps-script\QuestionsReview.html .
copy <path-to-this-repo>\apps-script\DraughtPricing.html .

# Merge Code.patches.js into Code.js (doGet archive route + inbound invoiceId)
# Optional permanent draught fix: DRYRUN_repairDraughtPortionData → REPAIR_draughtPortionData
# See comments in Code.patches.js

clasp push
git add InboundLog.html InvoiceHub.html InvoiceArchive.html QuestionsReview.html Code.js
git commit -m "Fix archive routing, Invoice Hub hang/style, inbound delete, questions pub reassign"
git push
```

Or grant the Cursor GitHub App access to `kinfold-invoicing` and re-run the agent against that repo so it can edit + PR there directly.

## Server-side must-dos (Code.js)

1. **`doGet`**: `page=archive` → `HtmlService` file **`InvoiceArchive`** (not Failed).
2. **`getInboundLog`**: include **`invoiceId`** on Processed rows (Delete uses it).
3. **`getInvoiceHubData`**: return summaries only / cache / cap rows so it finishes under the Apps Script limit.
4. Optional: add **`deleteInvoiceByInboundRef(fileId, invoiceNumber, pub)`** as in `Code.patches.js`.

## Test

- Admin: `admin.kinfoldinns.co.uk` → Archive / Invoice Hub / Inbound / Questions  
- Or `/exec?page=archive|invoicehub|inbound|questions`
