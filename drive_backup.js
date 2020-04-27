
const jsConsts = require('./JavaScripConstants');
const eventNames = require('./eventNames');
const programFilePath = require('./fileLocations');

const fetch = require(jsConsts.const_node_fetch);
const request = require(jsConsts.const_request);
const fs = require(jsConsts.const_fileServer);
const { google} = require(jsConsts.const_googleApis);

const electron = require(jsConsts.const_electron);
const {BrowserWindow} = electron;

//#region exports
module.exports.GoogleSignIn = function(sender, mainWindow) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
            console.log("\ngetting permissions for google drive!\n");
            GetGoogleDrivePermisions(sender, mainWindow);
        }
        else{
            oAuth2Client.setCredentials(JSON.parse(token));
            ListFiles(oAuth2Client);
        }
    });

};

module.exports.TokenPresent = false;
//#endregion

//#region variables
let credentials;
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/userinfo.profile'];
let approvalURL = "https://accounts.google.com/o/oauth2/approval/v2?auto=false&response=code";

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = programFilePath.userInfoFolder + '/token.json';
  
let oAuth2Client;  
let gotAuthToken = false; 
//#endregion

//#region functions 
fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
        this.TokenPresent = false;
    }
    else{
        this.TokenPresent = true;
    }
});

fs.readFile('credentials.json', (err, content) => {
    console.log("credientials read!\n\n");
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API
    credentials = JSON.parse(content);
});

function GetGoogleDrivePermisions(sender, mainWindow){
    let googleSignIn = new BrowserWindow({
        parent: mainWindow,
        width: 500,
        height: 630,
        modal: true,
        autoHideMenuBar: true, 
        webPreferences: {
        nodeIntegration: true
    }});

    ////
    googleSignIn.loadURL(GetAccessToken(),
                        {userAgent: 'Firefox'});
  
    //#region event handlers
    googleSignIn.webContents.on("did-navigate", (event, url)=>{
        if(url.indexOf(approvalURL) == 0){
            gotAuthToken = true;
        }
    });
    
    googleSignIn.webContents.on("page-title-updated", (event, title)=>{
        if(gotAuthToken){
            SaveTokenAndUserData(sender,title);
            googleSignIn.close();
            gotAuthToken = false;
        }
    });
    //#endregion

    googleSignIn.show();
};

function GetAccessToken() {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
  
    return authUrl;
};

function SaveTokenAndUserData(sender, title){
    let startIndex = 13;
    let endIndex = title.indexOf("&scope");
    let code = title.substring(startIndex, endIndex);
    oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
         
        SaveUserData(sender, token);

        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return console.error(err);
            console.log('Token stored to', TOKEN_PATH);
        });
                                
        ListFiles(oAuth2Client);
    });
};

function SaveUserData(sender, token){     
    link = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token.access_token; 

    fetch(link).then(res => res.json()).then((info) => {
        //create userinfo dir if not present
        fs.mkdir("UserInfo", () => {"user folder created"});

        //download user profile pic
        DownloadImage(info.picture, programFilePath.userProfilePic, function(){
            fs.writeFile(programFilePath.userInfo, JSON.stringify(info), (err) => {
                if (err) return console.error(err);
                console.log('user info stored to', programFilePath.userInfo);
            });
            
            console.log("signIn done!\n");
            sender.reply(eventNames.reply_signIn);
            
            console.log('saved profile picture');
        });

    }).catch(err => console.log(err));
};

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function ListFiles(auth) {
    const drive = google.drive({version: 'v3', auth});
  
    // drive.files.list({
    //   pageSize: 10,
    //   fields: 'nextPageToken, files(id, name)',
    // }, (err, res) => {
    //   if (err) return console.log('The API returned an error: ' + err);
    //   const files = res.data.files;
    //   if (files.length) {
    //     console.log('Files:');
    //     files.map((file) => {
    //       console.log(`${file.name} (${file.id})`);
    //     });
    //   } else {
    //     console.log('No files found.');
    //   }
    // });
};

function DownloadImage(uri, filename, callback){
    request.head(uri, function(err, res, body){
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};
 
//#endregion