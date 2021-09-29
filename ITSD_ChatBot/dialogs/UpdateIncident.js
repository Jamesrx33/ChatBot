const axios = require("axios");

//This function uses Axios to call the SWSD API to POST a new incident
//The incident is assigned to the user whose email was passed in the "assigneeEmail" parameter

    function reassignIncident(assignee, id) {

    var Data = {};
    const BASE_URL = `https://api.samanage.com/incidents/` +id+ '.xml'

    //Catch requests coming in for Service Desk team -- this is a group and requires a different data set in the call

    if(assignee.toLowerCase() == 'itservice@dpr.com' | assignee.toLowerCase() == 'servicedeskgroup@dpr.com'){
        var GroupID = '1786115';
        Data = {
            data: "<incident><assignee_id>"+GroupID+"</assignee_id></incident>" //Assign to group ID
        }
    }else{
        Data = {
            data: "<incident><assignee><email>"+assignee+"</email></assignee></incident>" //Assign to email of user
        }
    }

    const Config = {
        headers: {
        "X-Samanage-Authorization": "Bearer TOKEN",
        "Accept": "application/xml",
        "Content-Type": "text/xml"
       },
    };


    //Make PUT call to SWSD using the URL, Data, and Config variables
    const holdresponse = axios.put(BASE_URL, Data, Config)
    .then((response) => {
        console.log("Successfully made PUT Call");
      }, (error) => {
        console.log(error);
      });

    return holdresponse;
}


function closeIncident(id) {

    var Data = {};
    const BASE_URL = `https://api.samanage.com/incidents/` +id+ '.xml'

    const Config = {
        headers: {
        "X-Samanage-Authorization": "Bearer TOKEN",
        "Accept": "application/xml",
        "Content-Type": "text/xml"
       },
    };

    Data = {
        data: "<incident><state>Resolved</state></incident>" //Assign the Resolved state to the incident
    }


    //Make PUT call to SWSD using the URL, Data, and Config variables
    const holdresponse = axios.put(BASE_URL, Data, Config)
    .then((response) => {
        console.log("Successfully made PUT Call");
      }, (error) => {
        console.log(error);
      });

    return holdresponse;
}

module.exports.closeIncident = closeIncident;
module.exports.reassignIncident = reassignIncident;
