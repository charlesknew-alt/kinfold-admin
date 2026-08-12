/**
 * Kinfold invoicing — Code.js patches for clasp project
 * =====================================================
 * Apply against C:\Projects\kinfold\Code.js (or charlesknew-alt/kinfold-invoicing).
 * Then: clasp push
 *
 * These snippets are derived from live deployment behaviour + client contracts.
 * Search for the ANCHOR comments in your Code.js and merge carefully.
 */

// ---------------------------------------------------------------------------
// 1) doGet — ?page=archive must serve InvoiceArchive.html (NOT Failed Invoices)
// ---------------------------------------------------------------------------
// ANCHOR: find the page routing switch/if-chain in doGet(e)
// BUG: archive currently returns the Failed Invoices HTML (getFailedInvoices).
// FIX: map archive → InvoiceArchive file + title "Invoice Archive - Kinfold Inns"

function doGet_ARCHIVE_FIX_EXAMPLE_(e) {
  var page = ((e && e.parameter && e.parameter.page) || '').toLowerCase();
  var file, title;

  // ... keep existing cases ...

  if (page === 'archive') {
    file = 'InvoiceArchive'; // was incorrectly FailedInvoices / Failed template
    title = 'Invoice Archive - Kinfold Inns';
  } else if (page === 'failed') {
    file = 'FailedInvoices'; // or whatever the real failed file name is
    title = 'Failed Invoices - Kinfold Inns';
  } else if (page === 'invoicehub') {
    file = 'InvoiceHub';
    title = 'Invoice Hub - Kinfold Inns';
  } else if (page === 'inbound') {
    file = 'InboundLog';
    title = 'Inbound Activity - Kinfold Inns';
  }

  // Typical return:
  // return HtmlService.createHtmlOutputFromFile(file)
  //   .setTitle(title)
  //   .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ---------------------------------------------------------------------------
// 2) getInboundLog — include invoiceId on Processed rows (for Delete button)
// ---------------------------------------------------------------------------
// ANCHOR: inside getInboundLog / where each row object is built
// ADD field: invoiceId (internal id used by deleteInvoiceById)
// Resolve via pdf fileId and/or invoiceNumber+pub against the Invoices sheet.

/**
 * Helper: resolve internal invoice id from inbound refs.
 * Call from getInboundLog row builder, and from deleteInvoiceByInboundRef.
 */
function resolveInvoiceIdFromInboundRef_(fileId, invoiceNumber, pub) {
  fileId = String(fileId || '').trim();
  invoiceNumber = String(invoiceNumber || '').trim();
  pub = String(pub || '').trim();

  // Prefer matching by PDF file id column if your sheet has one (pdfFileId / FileId).
  // Fall back to invoiceNumber + pub contains-match (Windmill / Eight).
  // Return the same id string deleteInvoiceById already expects.

  // --- IMPLEMENTATION SKETCH (adapt to your sheet helpers) ---
  // var rows = getInvoiceSheetValues_();
  // for each data row:
  //   if (fileId && rowPdfId === fileId) return rowInvoiceId;
  // for each data row:
  //   if (invoiceNumber && rowInvNo === invoiceNumber && pubMatches_(rowPub, pub)) return rowInvoiceId;
  return null;
}

/**
 * New server entry used by InboundLog Delete when invoiceId is not yet on the row.
 * Reuses deleteInvoiceById once resolved. Does NOT reverse Product Master learning.
 * Does NOT delete other-pub copies.
 */
function deleteInvoiceByInboundRef(fileId, invoiceNumber, pub) {
  var id = resolveInvoiceIdFromInboundRef_(fileId, invoiceNumber, pub);
  if (!id) {
    return {
      success: false,
      error: 'Could not resolve invoice id from inbound row (fileId / invoice # / pub).'
    };
  }
  return deleteInvoiceById(id);
}

// In getInboundLog row push, add something like:
//   invoiceId: resolveInvoiceIdFromInboundRef_(fileId, invoiceNumber, pub) || ''

// ---------------------------------------------------------------------------
// 3) getInvoiceHubData — stop the Loading hang
// ---------------------------------------------------------------------------
// ANCHOR: function getInvoiceHubData()
// Likely cause: full-sheet scan + rich line payloads → Apps Script timeout / huge return.
// FIX strategy:
//   A) Return invoice summaries only (counts + totals), not every line
//   B) Cap rows (e.g. most recent 500) unless a filter is passed
//   C) Use CacheService for 60–120s
//   D) Never leave the client without success/failure — Hub HTML now has a 55s timeout too

/**
 * Drop-in shape expected by InvoiceHub.html:
 * { invoices: [...], statements: [...] }
 *
 * Each invoice: invoiceNumber, supplier, pub, invoiceDate, lines (count),
 *   netTotal, vatTotal, grossTotal, linked, pdfFileId
 */
function getInvoiceHubData_PATCH_NOTES_() {
  // 1. Wrap body in try/catch and always return {invoices:[], statements:[], error?:...}
  // 2. If current impl joins all line items, remove that — Hub only needs lines = count
  // 3. Optional cache:
  //    var cache = CacheService.getScriptCache();
  //    var hit = cache.get('invoiceHubData_v2');
  //    if (hit) return JSON.parse(hit);
  //    ... build payload ...
  //    cache.put('invoiceHubData_v2', JSON.stringify(payload), 90);
  // 4. Prefer reading a pre-aggregated range / summary sheet if one exists
}

// ---------------------------------------------------------------------------
// 4) getInvoiceArchive — ensure callable with filter object
// ---------------------------------------------------------------------------
// InvoiceArchive.html calls: getInvoiceArchive({ pub, supplier, from, to, q })
// If your existing getInvoiceArchive() takes no args, add an optional filters arg
// and filter server-side (date range especially) to keep payload small.
// Return shape (any of these works with the new HTML):
//   { invoices: [ { invoiceId, invoiceNumber, supplier, pub, invoiceDate,
//                   netTotal, vatTotal, grossTotal, pdfFileId, lines: [...] } ] }
//   or { rows: [...] } / { items: [...] }

function getInvoiceArchive_SIGNATURE_(filters) {
  filters = filters || {};
  // pub, supplier, from, to, q
  // Implement date-bounded query; include line items for matched invoices only.
}

// ---------------------------------------------------------------------------
// 5) reassignInvoiceToPub — already exists (used by Statements)
// ---------------------------------------------------------------------------
// Questions pub dropdown calls: reassignInvoiceToPub(invoiceNumber, targetPub)
// No server change required if Statements reassignment already works.
// targetPub values from UI: "Windmill" | "Eight Bells"
