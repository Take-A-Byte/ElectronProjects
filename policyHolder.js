module.exports.PolicyHolderDetails = class PolicyHolderDetails
{
    Name = "";
    PolicyNumber = "";
    PolicyType = "";
    IssueDate = "";
    MaturityDate = "";
    PaymentInterval = "";

    constructor(name, policyNo, policyTyp, issueDat, matDat, payInt){
        this.Name = name;
        this.PolicyNumber = policyNo;
        this.PolicyType = policyTyp;
        this.IssueDate = issueDat;
        this.MaturityDate = matDat;
        this.PaymentInterval = payInt;
    }
}