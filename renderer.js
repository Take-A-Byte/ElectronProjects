const name = document.getElementById('name');
const policyNumber = document.getElementById('policyNumber');
const policyType = document.getElementById('policyType');
const issueDate = document.getElementById('issueDate');
const maturityDate = document.getElementById('maturityDate');
const paymentInterval = document.getElementById('payInterval');

function onSubmit(){
    console.log(name.value, 
        policyNumber.value,
        policyType.value, 
        issueDate.value, 
        maturityDate.value, 
        paymentInterval.value);
}