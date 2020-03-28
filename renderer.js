
const jsConsts = require('./JavaScripConstants');

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
        issueDate.value, 
        maturityDate.value, 
        paymentInterval.value );

        // console.log(details);
}