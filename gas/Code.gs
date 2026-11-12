/**
 * WAZIZ SHOP — Order receiver (Google Apps Script)
 * ──────────────────────────────────────────────────
 * Deploy this as a Web App. It receives the JSON payload sent by
 * /assets/js/order-api.js and appends one row per order to a Google Sheet.
 * No API keys or tokens are exposed to the browser — this script is the
 * only place that needs configuring, and it runs entirely on Google's
 * servers.
 *
 * SETUP (5 minutes):
 * 1. Create a new Google Sheet. Add a header row to the first tab:
 *    Date | Name | Phone | City | Address | Items | Total
 * 2. Open Extensions → Apps Script, delete the boilerplate, paste this file.
 * 3. Click Deploy → New deployment → type "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the deployment URL (ends in /exec) into
 *    assets/js/config.js → GAS_ENDPOINT.
 * 5. (Optional) Set SHEET_ID below if the script isn't bound to the sheet.
 */

const SHEET_NAME = 'Orders';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet_();

    const itemsSummary = data.items
      .map(it => `${it.name}${it.color ? ' · ' + it.color : ''}${it.size ? ' · ' + it.size : ''} (${it.price} درهم)`)
      .join(' | ');

    sheet.appendRow([
      new Date(data.date || Date.now()),
      data.name,
      data.phone,
      data.city,
      data.address,
      itemsSummary,
      data.total
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Date', 'Name', 'Phone', 'City', 'Address', 'Items', 'Total']);
  }
  return sheet;
}