// ============================================================
// كود Google Apps Script — كينسخ الطلبات لـ Google Sheet
// خطوات التركيب كاملين فـ README.md
// ============================================================

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // إلا كانت الورقة فارغة، زيد رؤوس الأعمدة أول مرة
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['التاريخ', 'اسم المتجر', 'اسم الزبون', 'الهاتف', 'العنوان', 'المنتجات', 'المجموع']);
  }

  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.date || new Date().toISOString(),
    data.storeName || '',
    data.customerName || '',
    data.phone || '',
    data.address || '',
    data.items || '',
    data.total || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'الخدمة خدامة' }))
    .setMimeType(ContentService.MimeType.JSON);
}
