const SHEET_NAME = 'FormResponses';
const HEADERS = ['Timestamp', 'Name', 'Email', 'Subject', 'Message', 'Page URL', 'User Agent'];

function doGet() {
  return jsonOutput_({ status: 'ok' });
}

function doPost(e) {
  try {
    const sheet = getOrCreateSheet_();
    ensureHeaders_(sheet);

    const data = (e && e.parameter) ? e.parameter : {};
    const row = [
      new Date(),
      data.name || '',
      data.email || '',
      data.subject || '',
      data.message || '',
      data.page || '',
      data.userAgent || ''
    ];

    sheet.appendRow(row);
    return jsonOutput_({ status: 'success' });
  } catch (error) {
    return jsonOutput_({ status: 'error', message: String(error) });
  }
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return;
  }

  const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const normalizedCurrent = currentHeaders.map(String);
  const expected = HEADERS.map(String);
  if (JSON.stringify(normalizedCurrent) !== JSON.stringify(expected)) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function jsonOutput_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

