
// --- CODE.GS CONTENT ---

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Data Keuangan Harian')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// --- DATABASE HELPER FUNCTIONS ---

function getSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Optional: Add headers if new
  }
  return sheet;
}

function getData(collectionName, userId) {
  var sheet = getSheet(collectionName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var result = [];
  
  if (data.length > 1) {
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var item = {};
      for (var j = 0; j < headers.length; j++) {
        item[headers[j]] = row[j];
      }
      // Simple filter by userId (in real app, better security needed)
      if (item.userId === userId) {
        result.push(item);
      }
    }
  }
  return result;
}

function createItem(collectionName, item) {
  var sheet = getSheet(collectionName);
  var headers = [];
  
  if (sheet.getLastRow() === 0) {
    // Create headers from item keys
    headers = Object.keys(item);
    sheet.appendRow(headers);
  } else {
    headers = sheet.getDataRange().getValues()[0];
  }
  
  var row = [];
  // Ensure row order matches headers
  for (var i = 0; i < headers.length; i++) {
    row.push(item[headers[i]] || '');
  }
  
  sheet.appendRow(row);
  return item;
}

function updateItem(collectionName, item) {
  var sheet = getSheet(collectionName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIndex = headers.indexOf('id');
  
  if (idIndex === -1) return null;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][idIndex] == item.id) {
      // Found row, update it
      var newRow = [];
      for (var j = 0; j < headers.length; j++) {
        var header = headers[j];
        // Update if present in new item, else keep old
        newRow.push(item.hasOwnProperty(header) ? item[header] : data[i][j]);
      }
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([newRow]);
      return item;
    }
  }
  return null;
}

function deleteItem(collectionName, id) {
  var sheet = getSheet(collectionName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIndex = headers.indexOf('id');
  
  if (idIndex === -1) return;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][idIndex] == id) {
      sheet.deleteRow(i + 1);
      return id;
    }
  }
}

function hardReset(userId) {
  var collections = ["bku", "bkp", "peminjam", "setoran", "manual_payments", "reconciliation"];
  collections.forEach(function(col) {
    var sheet = getSheet(col);
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;
    
    var headers = data[0];
    var userIndex = headers.indexOf('userId');
    
    if (userIndex === -1) return;
    
    // Delete from bottom to top to maintain indices
    for (var i = data.length - 1; i >= 1; i--) {
      if (data[i][userIndex] === userId) {
        sheet.deleteRow(i + 1);
      }
    }
  });
}

// --- AUTH FUNCTIONS ---

function loginUser(email, password) {
  var users = getData('users', null); // Pass null/ignore userId filter for users collection
  for (var i = 0; i < users.length; i++) {
    if (users[i].email == email && users[i].password == password) {
      return users[i];
    }
  }
  throw new Error("Invalid credentials");
}

function registerUser(email, password) {
  var users = getData('users', null);
  for (var i = 0; i < users.length; i++) {
    if (users[i].email == email) {
      throw new Error("Email already exists");
    }
  }
  
  var newUser = {
    id: Utilities.getUuid(),
    email: email,
    password: password,
    role: email === 'admin@bacol.dev' ? 'admin' : 'user'
  };
  
  createItem('users', newUser);
  return newUser;
}
