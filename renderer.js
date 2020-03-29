
const jsConsts = require('./JavaScripConstants');
const eventNames = require('./eventNames');

const electron = require(jsConsts.const_electron);
const ipc = electron.ipcRenderer;

const holderDetails = require('./policyHolder');

const name = document.getElementById('name');
const policyNumber = document.getElementById('policyNumber');
const policyType = document.getElementById('policyType');
const issueDate = document.getElementById('issueDate');
const maturityDate = document.getElementById('maturityDate');
const paymentInterval = document.getElementById('payInterval');

function onSubmit(){
    details = new holderDetails.PolicyHolderDetails(name.value, 
        policyNumber.value,
        policyType.value, 
        new Date(issueDate.value).getTime(), 
        new Date(maturityDate.value).getTime(), 
        paymentInterval.value);
    
    ipc.send(eventNames.requestAddHolder, details);
};

function retriveReminderForWeek(){
    ipc.send(eventNames.requestReminders);
};

//#region IPC event handlers
ipc.on(eventNames.addHolderRequestReply, (event, args) => {
    if(args[0] != null) alert(args[0]);
    else alert("Policy Holder Added!");
    console.log(args);
});

ipc.on(eventNames.reminderRequestReply, (event, args) => {
    if(args[0] != null) alert(args[0]);
    else alert("Policy Reminders recovered sucessfully!");
    console.log(args[1]);
});
//#endregion