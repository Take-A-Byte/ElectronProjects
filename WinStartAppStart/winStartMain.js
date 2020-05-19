
const Datastore = require('nedb');
const notifier = require('node-notifier');
const spawn = require('child_process').spawn;
const path = require('path');

const database = new Datastore('../Data/database.db');
database.loadDatabase();
RefreshDatabase();


//////////////////////////////////////////

function RefreshDatabase(){
    console.log('refreshing');
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
        
        LoadReminders();
    });
};

function LoadReminders() {
    console.log('loading reminders');
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

        let msg = 'Hi there!\nCurrently, there are a total of ' + weekReminder.length + ' payment(s) due.\nVisit Reminders page for more info.';
        if(weekReminder.length == 0)
        {
            msg = 'Hi there!\nCurrently, there are no payments due!';
        }

        notifier.notify(
        {
            title: 'Policy Agent Companion',
            message:msg,
            icon: path.join('icon.png'), // Absolute path (doesn't work on balloons)
            sound: true, // Only Notification Center or Windows Toasters
            wait: false, // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
            timeout: 15
        },
        function(err, response) {
            console.log('response: ',response);
            var child = spawn(path.join(process.cwd(), '..', '/AgentCompanion/agent-companion.exe'), [], {
                detached: true ,
                stdio: [ 'ignore', 'ignore', 'ignore' ]
            });
            
            child.unref();
            process.exit(1);
        }
        );
        
        notifier.on('click', function(notifierObject, options, event) {
            console.log('clicked!');
            process.exit(1);
        });
        
        notifier.on('timeout', function(notifierObject, options) {
            console.log('timedout!');
            process.exit(1);
        });
    });
};
////////////////////////////////////////////