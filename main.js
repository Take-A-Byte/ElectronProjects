//#region electron_requirements
const jsConsts = require('./JavaScripConstants');

const electron = require(jsConsts.const_electron);
const url = require(jsConsts.const_url);
const path = require(jsConsts.const_path);

const {app, BrowserWindow} = electron;
//#endregion

//#region nedb_requirements
const Datastore = require(jsConsts.const_nedb);

const database = new Datastore('database.db');
//#endregion
    
let mainWindow;

database.loadDatabase();

app.on('ready', function(){
    mainWindow = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
        nodeIntegration: true
    }});
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));
    mainWindow.openDevTools();
});