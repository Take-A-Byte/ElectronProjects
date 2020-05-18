//#region electron_requirements
const jsConsts = require('./JavaScripConstants');
const eventNames = require('./eventNames');

const drive_backup = require(jsConsts.const_backup);

const PolicyHolderDetails = require('./policyHolderModel').PolicyHolderDetails;

const electron = require(jsConsts.const_electron);
const url = require(jsConsts.const_url);
const path = require(jsConsts.const_path);
const ipc = electron.ipcMain;

const { app, BrowserWindow, Notification } = electron;

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
ipc.on(eventNames.requestTokenStatus, (event) =>{
    event.reply(eventNames.reply_tokenStatus, drive_backup.TokenPresent);
});

ipc.on(eventNames.requestAddHolder, (event, reply) => {
    console.log(reply);
    database.insert(reply, (err, newDoc) => {
        console.log(err);

        event.reply(eventNames.reply_addHolder, [err, newDoc]);
    });
});

ipc.on(eventNames.requestReminders, (event) => {
    database.find({}, (err, docs) => {
        var weekReminder = [];
    
        var dateBefore30Days = new Date(new Date(Date.now()).getTime() - (30 * 24 * 60 * 60 * 1000));

        docs.forEach(element => {
            console.log(element.Name);
            var nextPayDate = new Date(element.NextPaymentDate);

            if(nextPayDate < Date.now() && nextPayDate > dateBefore30Days)
            {
                
                var dateAfter30Days = new Date(nextPayDate.getTime() + (30 * 24 * 60 * 60 * 1000));
                var dueStartDate = nextPayDate.getUTCDate() + '/' + nextPayDate.getUTCMonth() + '/' + nextPayDate.getUTCFullYear(); 
                var dueEndDate = dateAfter30Days.getUTCDate() + '/' + dateAfter30Days.getUTCMonth() + '/' + dateAfter30Days.getUTCFullYear(); 

                weekReminder.push(
                    "Reminder for " + element.Name + ", with Policy No. " + element._id +
                    " has to pay premium of Rs." + element.premium + " in between " + dueStartDate + " and " +  dueEndDate + 
                    "\nMobile number: " + element.MobileNo);
            }
        });

        event.reply(eventNames.reply_reminders, [err, weekReminder]);
            
        var myNotification = new Notification({
            title: 'Policy Agent Companion', 
            body: 'Hi there!\nThere are a total of ' + weekReminder.length + ' payment(s) due.\nVisit Reminders page for more info.'
        });

        myNotification.on('click', (event, reply) => {
            console.log('Notification clicked')
        });
        
        myNotification.show();
    });
    
});

ipc.on(eventNames.requestSignIn, (event, reply) => {
    drive_backup.GoogleSignIn(event, mainWindow);
});
//#endregion

function RefreshDatabase(){
    database.find({ }, function (err, docs) {
        docs.forEach(element => {
            console.log(element.Name);
            var nextDateSet = false;
            var date = new Date(element.NextPaymentDate);
            console.log(date);
            var dateBefore30Days = new Date(new Date(Date.now()).getTime() - (30 * 24 * 60 * 60 * 1000));

            if(date < dateBefore30Days)
            {
                console.log('changing next payment date for: ' + element.Name + " from " + date);
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
