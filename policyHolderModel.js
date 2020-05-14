module.exports.PolicyHolderDetails = class PolicyHolderDetails
{
    Name = "";
    DOB = "";
    MobileNo = "";
    _id = "";
    PolicyTermCode = "";
    IssueDate = "";
    MaturityDate = "";
    PaymentInterval = "";
    Premium = "";
    IsPaymentDue = "";
    NextPaymentDate = "";

    constructor(name, dob, mobileNo, policyNo, policyTermCode, issueDat, matDat, payInt, premium){
        this.Name = name;
        this.DOB = dob;
        this.MobileNo = mobileNo;
        this._id = policyNo;
        this.PolicyTermCode = policyTermCode;
        this.IssueDate = issueDat;
        this.MaturityDate = matDat;
        this.PaymentInterval = payInt;
        this.premium = premium;
        this.IsPaymentDue = true;

        var nextDateSet = false;
        var date = new Date(this.IssueDate);
        
        var dateBefore30Days = new Date(new Date(Date.now()).getTime() - (30 * 24 * 60 * 60 * 1000));
        do{
            date = new Date(date.getTime() + (this.PaymentInterval * 24 * 60 * 60 * 1000));

            if(date > dateBefore30Days)
            {
                this.NextPaymentDate = date.getTime();
                nextDateSet = true;
            }
        }while(!nextDateSet)

        console.log(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
    }
}