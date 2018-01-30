/*global require,console,setTimeout */
var opcua = require("node-opcua");
var async = require("async");

var client = new opcua.OPCUAClient();
var endpointUrl = "opc.tcp://" + require("os").hostname() + ":4334/UA/MyLittleServer";

var the_session, the_subscription;

async.series([

    // step 1 : connect to
    function(callback)  {
        client.connect(endpointUrl,function (err) {
            if(err) {
                console.log(" cannot connect to endpoint :" , endpointUrl );
            } else {
                console.log("connected !");
            }
            callback(err);
        });
    },

    // step 2 : createSession
    function(callback) {
        client.createSession( function(err,session) {
            if(!err) {
                the_session = session;
            }
            callback(err);
        });
    },
    
    // step 3: install a subscription and install a monitored item for 30 seconds
    function(callback) {
       
       the_subscription=new opcua.ClientSubscription(the_session,{
           requestedPublishingInterval: 500,
           requestedLifetimeCount: 10,
           requestedMaxKeepAliveCount: 5,
           maxNotificationsPerPublish: 10,
           publishingEnabled: true,
           priority: 1
       });
       
       the_subscription.on("started",function(){
           console.log("subscription started for 2 seconds - subscriptionId=",the_subscription.subscriptionId);
       }).on("keepalive",function(){
           console.log("keepalive1");
       }).on("terminated",function(){
           callback();
       });
       
       setTimeout(function(){
           the_subscription.terminate();
       },30000);
       
       // install monitored item
       var monitoredItem  = the_subscription.monitor({
           nodeId: opcua.resolveNodeId("ns=1;s=csv"),
           attributeId: opcua.AttributeIds.Value
       },
       {
           samplingInterval: 250,
           discardOldest: true,
           queueSize: 1
       },
       opcua.read_service.TimestampsToReturn.Both
       );
       console.log("-------------------------------------");
       
       monitoredItem.on("changed",function(dataValue){
          console.log(" % csv file = ",dataValue.value.value);
          var jsn = JSON.parse(dataValue.value.value);
        //   console.log(jsn);
          if (jsn != null){
            saveToFile(jsn);
          } 
       });
    },

    // close session
    function(callback) {
        the_session.close(function(err){
            if(err) {
                console.log("session closed failed ?");
            }
            callback();
        });
    }

],
function(err) {
    if (err) {
        console.log(" failure ",err);
    } else {
        console.log("done!");
    }
    client.disconnect(function(){});
}) ;

function saveToFile (row){
    var fs = require('fs');
    var json2csv = require('json2csv');
    var newLine= "\r\n";
    
    var fields = ['Date', 'Sensor-1', 'Sensor-2', 'Sensor-3', 'Sensor-4', 'Sensor-5', 'Sensor-6', 'Sensor-7', 'Sensor-8', 'Sensor-9', 'Sensor-10'];
    
    var appendThis = [ 
        {
        "Date": row["Date"],
        "Sensor-1": row["Sensor-1"],
        "Sensor-2": row["Sensor-2"],
        "Sensor-3": row["Sensor-3"],
        "Sensor-4": row["Sensor-4"],
        "Sensor-5": row["Sensor-5"],
        "Sensor-6": row["Sensor-6"],
        "Sensor-7": row["Sensor-7"],
        "Sensor-8": row["Sensor-8"],
        "Sensor-9": row["Sensor-9"],
        "Sensor-10": row["Sensor-10"]
        }
    ];
    
    var toCsv = {
        data: appendThis,
        fields: fields,
        hasCSVColumnTitle: false
    };
    
    fs.stat('file.csv', function (err, stat) {
        if (err == null) {
            console.log('File exists');
    
            //write the actual data and end with newline
            var csv = json2csv(toCsv) + newLine;
    
            fs.appendFile('file.csv', csv, function (err) {
                if (err) throw err;
                // console.log('Data was appended to file!');
            });
        }
        else {
            var csv = json2csv(toCsv) + newLine;
 
            fs.writeFile('file.csv', csv, function(err) {
                if (err) throw err;
                // console.log('file saved');
            });
        }
    }); 
};

