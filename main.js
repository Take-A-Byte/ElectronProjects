//#region electron_requirements
const jsConsts = require('./JavaScripConstants');
const eventNames = require('./eventNames');

const PolicyHolderDetails = require('./policyHolder').PolicyHolderDetails;

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
let mainWindow, myNotification;

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

    console.log(mainWindow.location)

    myNotification = new Notification({
        title: 'Title', 
        body: 'Lorem Ipsum Dolor Sit Amet'
    });

    myNotification.on('click', (event, reply) => {
        console.log('Notification clicked')
    });
    
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
    
    myNotification.show();
    
});


/////
 
    // client id of the project
    var clientId = "640191146884-lr73jgorgnsr9v5vbtugqa6lobg843tl.apps.googleusercontent.com";

    // redirect_uri of the project
    var redirect_uri = "http://localhost";

    // scope of the project
//https://www.googleapis.com/auth/drive	See, edit, create, and delete all of your Google Drive files
//https://www.googleapis.com/auth/drive.file View and manage Google Drive files and folders that you have opened or created with this app
//https://www.googleapis.com/auth/drive.metadata.readonly View metadata for files in your Google Drive
//https://www.googleapis.com/auth/drive.photos.readonly View the photos, videos and albums in your Google Photos
//https://www.googleapis.com/auth/drive.readonly See and download all your Google Drive files
    var scope = "https://www.googleapis.com/auth/drive.file";

    // // the url to which the user is redirected to
     var gourl = "";

    function signIn(clientId,redirect_uri,scope,url){
        // the actual url to which the user is redirected to  
        var gourl = "https://accounts.google.com/o/oauth2/v2/auth?redirect_uri="+redirect_uri
        +"&prompt=consent&response_type=code&client_id="+clientId+"&scope="+scope
        +"&access_type=offline";
        // this line makes the user redirected to the url
        //window.location = gourl;

        return gourl;
     }
/////

ipc.on(eventNames.requestSignIn, (event, reply) => {
    let googleSignIn = new BrowserWindow({
        parent: mainWindow,
        width: 500,
        height: 630,
        modal: true,
        autoHideMenuBar: true, 
        webPreferences: {
        nodeIntegration: true
    }});

    googleSignIn.loadURL(signIn(clientId,redirect_uri,scope,url),
        {userAgent: 'Firefox'});
    // googleSignIn.openDevTools();

    googleSignIn.show();
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
