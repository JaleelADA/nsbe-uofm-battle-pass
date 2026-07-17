/**
 * NSBE UM Battle Pass — privacy-friendly data endpoint (Option B in SETUP.md)
 *
 * Paste this whole file into Extensions → Apps Script inside your sign-in
 * responses spreadsheet, then Deploy → New deployment → Web app
 * (Execute as: Me, Who has access: Anyone) and copy the /exec URL into
 * "signInDataUrl" in config.json.
 *
 * It shares ONLY Timestamp + Uniqname + Event with the website. Emails and
 * full names stay private inside the sheet.
 */

function doGet() {
  var sheet = findResponsesSheet_();
  var data = sheet.getDataRange().getValues();
  if (data.length === 0) {
    return json_({ values: [['Timestamp', 'Uniqname', 'Event']] });
  }

  var headers = data[0].map(function (h) { return String(h).toLowerCase(); });
  var tsCol = findCol_(headers, 'timestamp');
  var uniqCol = findCol_(headers, 'uniqname');
  var eventCol = findCol_(headers, 'event');

  var out = [['Timestamp', 'Uniqname', 'Event']];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    out.push([
      tsCol >= 0 ? formatDate_(row[tsCol]) : '',
      uniqCol >= 0 ? String(row[uniqCol]).trim() : '',
      eventCol >= 0 ? String(row[eventCol]).trim() : ''
    ]);
  }
  return json_({ values: out });
}

/** First sheet whose name contains "Form Responses", else the first sheet. */
function findResponsesSheet_() {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().toLowerCase().indexOf('form responses') !== -1) return sheets[i];
  }
  return sheets[0];
}

function findCol_(headers, word) {
  for (var i = 0; i < headers.length; i++) {
    if (headers[i].indexOf(word) !== -1) return i;
  }
  return -1;
}

function formatDate_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'M/d/yyyy');
  }
  return String(value);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
