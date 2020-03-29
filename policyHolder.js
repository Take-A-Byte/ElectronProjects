module.exports.PolicyHolderDetails = class PolicyHolderDetails
{
    Name = "";
    _id = "";
    PolicyType = "";
    IssueDate = "";
    MaturityDate = "";
    PaymentInterval = "";
    NextPaymentDate = "";

    constructor(name, policyNo, policyTyp, issueDat, matDat, payInt){
        this.Name = name;
        this._id = policyNo;
        this.PolicyType = policyTyp;
        this.IssueDate = issueDat;
        this.MaturityDate = matDat;
        this.PaymentInterval = payInt;

        var nextDateSet = false;
        var date = new Date(this.IssueDate);
        // console.log(date);
        do{
            date = new Date(date.getTime() + (this.PaymentInterval * 24 * 60 * 60 * 1000));

            if(date > Date.now())
            {
                this.NextPaymentDate = date.getTime();
                nextDateSet = true;
            }
        }while(!nextDateSet)

        console.log(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
    }
}