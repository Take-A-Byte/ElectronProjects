//#region electron_requirements
const jsConsts = require('./JavaScripConstants');
const eventNames = require('./eventNames');

const PolicyHolderDetails = require('./policyHolder').PolicyHolderDetails;

const electron = require(jsConsts.const_electron);
const url = require(jsConsts.const_url);
const path = require(jsConsts.const_path);
const ipc = electron.ipcMain;

const {app, BrowserWindow} = electron;
//#endregion

//#region nedb_requirements and instantiation
const Datastore = require(jsConsts.const_nedb);

const database = new Datastore('database.db');
database.loadDatabase();
RefreshDatabase();
//#endregion
    

//#region mainWin Instantiation
let mainWindow;

app.on('ready', function(){
    mainWindow = new BrowserWindow({
        webPreferences: {
        nodeIntegration: true
    }});
    mainWindow.maximize();
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));
    mainWindow.openDevTools();
});
//#endregion

//#region ipc event handler
ipc.on(eventNames.requestAddHolder, (event, reply) => {
    database.insert(reply, (err, newDoc) => {
        console.log(err);

        event.reply(eventNames.addHolderRequestReply, [err, newDoc]);
    });
});

ipc.on(eventNames.requestReminders, (event) => {

    database.find({}, (err, docs) => {
        var weekReminder = [];
    
        docs.forEach(element => {
            
            var dateAfterWeek = new Date(Date.now());
            dateAfterWeek = new Date(dateAfterWeek.getTime() + (7 * 24 * 60 * 60 * 1000));

            var nextPayDate = new Date(element.NextPaymentDate);

            if(nextPayDate > Date.now() && nextPayDate < dateAfterWeek)
            {
                weekReminder.push("Reminder for " + element.Name + ",with Policy No. " + element._id +
                 " has payment due on: " + new Date(element.NextPaymentDate));
            }
        });

        event.reply(eventNames.reminderRequestReply, [err, weekReminder]);
    });
});
//#endregion

function RefreshDatabase(){
    database.find({ }, function (err, docs) {
        docs.forEach(element => {
            console.log(element.Name);
            var nextDateSet = false;
            var date = new Date(element.NextPaymentDate);

            if(date < Date.now())
            {
                do{
                    date = new Date(date.getTime() + (element.PaymentInterval * 24 * 60 * 60 * 1000));
    
                    if(date > Date.now())
                    {   
                        database.update({_id: element._id}, 
                            { $set: {"NextPaymentDate": date.getTime()}});
                        console.log(date);
                        nextDateSet = true;
                    }
                }while(!nextDateSet)
            }
            
            database.loadDatabase();
        });
    });
};
