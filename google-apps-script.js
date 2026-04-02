/**
 * Google Apps Script for saving Leads and Quiz Results
 * 
 * 1. Create a Google Sheet.
 * 2. Extensions > Apps Script.
 * 3. Paste this code.
 * 4. Deploy > New Deployment > Web App.
 * 5. Set 'Who has access' to 'Anyone'.
 * 6. Copy the URL to your Quiz Frontend.
 */

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheets()[0]; // Use the first sheet

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const nextRow = sheet.getLastRow() + 1;

    const data = JSON.parse(e.postData.contents);
    const row = [];

    // Map incoming JSON keys to columns based on headers
    for (let i = 0; i < headers.length; i++) {
      if (headers[i] === 'Timestamp') {
        row.push(new Date());
      } else {
        row.push(data[headers[i]] || "");
      }
    }

    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': err }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// Initial setup to create headers
function setup() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheets()[0];
  const headers = ['Timestamp', 'Name', 'Mobile', 'Score'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}
