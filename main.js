//#region electron_requirements
const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow} = electron;
//#endregion

//#region nedb_requirements
const Datastore = require('nedb');

const database = new Datastore('database.db');
//#endregion
    
let mainWindow;

database.loadDatabase();

app.on('ready', function(){
    mainWindow = new BrowserWindow({});
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }))
});