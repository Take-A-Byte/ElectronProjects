
const jsConsts = require('./JavaScripConstants');
const eventNames = require('./eventNames'); 
const programFilePath = require('./fileLocations');

const fs = require(jsConsts.const_fileServer); 
const electron = require(jsConsts.const_electron);
const ipc = electron.ipcRenderer;

const holderDetails = require('./policyHolderModel');

const name = document.getElementById('name');
const policyNumber = document.getElementById('policyNumber');
const policyType = document.getElementById('policyType');
const issueDate = document.getElementById('issueDate');
const maturityDate = document.getElementById('maturityDate');
const paymentInterval = document.getElementById('payInterval');

const login = document.getElementById('login');
const username = document.getElementById('username');
const dp = document.getElementById('dp');

//#region IPC event handlers
ipc.on(eventNames.reply_addHolder, (event, args) => {
    if(args[0] != null) alert(args[0]);
    else alert("Policy Holder Added!");
    console.log(args);
});

ipc.on(eventNames.reply_reminders, (event, args) => {
    if(args[0] != null) alert(args[0]);
    else alert("Policy Reminders recovered sucessfully!");
    console.log(args[1]);
});

ipc.on(eventNames.reply_tokenStatus, (event, arg) => {
    console.log("in reply", arg);
    if(arg){
        fs.readFile(programFilePath.userInfo, (err, data) => {
            if(err){
                console.log(err);
            }
            else{
                var userData = JSON.parse(data);
                login.style.display = "none"; 
                dp.src = programFilePath.userProfilePic;
                dp.style.display = "inline";
                username.innerHTML = userData.name;
            }
        });
    };
});

ipc.on(eventNames.reply_signIn, (event) => {
    fs.readFile(programFilePath.userInfo, (err, data) => {
        if(err){
            console.log(err);
        }
        else{
            var userData = JSON.parse(data);
            login.style.display = "none"; 
            dp.src = programFilePath.userProfilePic;
            dp.style.display = "inline";
            username.innerHTML = userData.name;
        }
    });
});
//#endregion

function MainWindowLoaded(){
    const content = document.getElementById('content');
    content.innerHTML = "<h5> HOME </h5>";
    ipc.send(eventNames.requestTokenStatus);
};

function retriveReminderForWeek(){
    ipc.send(eventNames.requestReminders);
};

function onSubmit(){
    console.log('in submit function');
    details = new holderDetails.PolicyHolderDetails(name.value, 
        policyNumber.value,
        policyType.value, 
        new Date(issueDate.value).getTime(), 
        new Date(maturityDate.value).getTime(), 
        paymentInterval.value);
    
    ipc.send(eventNames.requestAddHolder, details);
};

function onHomeClicked(){
    const content = document.getElementById('content');

    content.innerHTML = "<h5> HOME </h5>";
};

function onAddHolderClicked(){
    const content = document.getElementById('content');

    fs.readFile('addPolicyHolder.html', (err, data) => { 
        if (err) throw err; 
      
        content.innerHTML = data.toString();
    });
}

function onRemindersClicked(){
    const content = document.getElementById('content');

    fs.readFile('reminders.html', (err, data) => { 
        if (err) throw err; 
      
        content.innerHTML = data.toString();
    });
};

function onSignIn(){
    ipc.send(eventNames.requestSignIn);
}

$( '#topheader .navbar-nav a' ).on( 'click', function () {
	$( '#topheader .navbar-nav' ).find( 'li.active' ).removeClass( 'active' );
	$( this ).parent( 'li' ).addClass( 'active' );
});
