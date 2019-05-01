const {google} = require('googleapis');

var jwt_client;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

module.exports = Spreadsheets;

function Spreadsheets(sheet_id) {
  var self = this;
  var activeStreams = 0

  this.callbacks = [];
  this.authData = null;
  this.sheetId = sheet_id;

  // public methods
  this.on = function (name, callback) {
    this.callbacks[name] = callback;
  }

  this.authWith = function(credentials) {
    useServiceAccountAuth(credentials, function onAuthDone(authData) {
      self.authData = authData;
      getSheets();
    }); 
  }

  this.exportSheet = function (sheetProperties, fileName) {
    // формируем название листа для google API
    let sheetRange = sheetProperties.title + '!A:' + convertColumnNumberToLetter(sheetProperties.gridProperties.columnCount);

    getSheetData(sheetRange, fileName);
  }

  // private methods
  function useServiceAccountAuth(creds, cb) {
    if (typeof creds == 'string') {
      try {
        creds = require(creds);
      } catch (err) {
        return cb(err);
      }
    }

    jwt_client = new google.auth.JWT(creds.client_email, null, creds.private_key, SCOPES, null);
    renewJwtAuth(cb);
  }

  function renewJwtAuth(cb) {
    auth_mode = 'jwt';
    jwt_client.authorize(function (err, token) {
      // TODO: store token local?
      if (err) return cb(err);

      jwt_client.credentials = token;
      cb(jwt_client);
    });
  }
   
  function convertColumnNumberToLetter(n) {
    let result = '';

    if (n <= 26) {
      result = String.fromCharCode(64 + n);
    } else {      
      let div = Math.floor(n / 26);
      result = convertColumnNumberToLetter(div) + convertColumnNumberToLetter(n - div * 26 );
    }

    return result;
  }

  function getSheets() {
    let sheets = google.sheets({version: 'v4'});
    let request = {
      spreadsheetId: self.sheetId
    };

    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/get
    sheets.spreadsheets.get(request, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }

      for (var sheet of response.sheets) {
        if (self.callbacks['get_sheet']) {
          self.callbacks['get_sheet'](sheet.properties);
        }
      }
    });
  }

  function getSheetData(sheetRange, sheetName) {
    activeStreams++;

    getRows(sheetRange, function (data) {
      if (self.callbacks['data']) {
        self.callbacks['data'](sheetName, data.content);
      }

      activeStreams--;
      if (activeStreams == 0) {
        if (self.callbacks['finish']) {
          // вызываем коллбэк при завершении всех 
          self.callbacks['finish']();
        }
      }
    });
  }

  function getRows(sheetRange, callback) {
    let sheets = google.sheets('v4');
    let request = {
      auth: self.authData,
      spreadsheetId: self.sheetId,
      range: sheetRange,
    };

    sheets.spreadsheets.values.get(request, function onDataGet(err, response) {
       if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }
      
      let values = response.values;
      let usedCols = [];

      for (let i=0; i<values[0].length; i++) {
        // если название начинается с `#`, то эту колонку НЕ надо экспортировать
        // если название пустое, то колонка тоже игнорируется!
        if (values[0][i].length > 0 && values[0][i].indexOf('#') != 0) {
          usedCols.push(i);
        }
      }

      let rows = [];
      for (let i=0; i<values.length; i++) {
        let row = [];

        for (let index of usedCols) {
          row.push(values[i][index]);
        }

        // если значение из первой колонки начинается с `#`, то игнорим ВСЮ строку
        if (row[0].indexOf('#') != 0) {
          rows.push(row);
        }
      }

      return callback({'content': rows});
    });
  }

  return this;
};