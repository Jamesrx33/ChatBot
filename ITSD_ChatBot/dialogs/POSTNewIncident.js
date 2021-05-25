const axios = require("axios");

//This function uses Axios to call the SWSD API to POST a new incident
//The incident is assigned to the user whose email was passed in the "assigneeEmail" parameter

    function postNewIncident(assignee, title, details) {
    const BASE_URL = `https://api.samanage.com/incidents.xml`

    const Config = {
        headers: {
        "X-Samanage-Authorization": "Bearer c2FtYW5hZ2VfYXBpQGRwci5jb20=:eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyX2lkIjoxOTMxOTY0LCJnZW5lcmF0ZWRfYXQiOiIyMDIwLTEwLTA1IDIxOjA2OjAzIn0.69UK-OT6TBLKBuoMAGfmf8blKvK2i-XQgUZbhZCCKgfJhDCGEAlcmHx5ylYnUcBctD42wzMgRS818Q7GNrps5g",
        "Accept": "application/xml",
        "Content-Type": "text/xml"
       },
    };

if(assignee.toLowerCase() == 'itservice' || assignee.toLowerCase() == 'itservice@dpr.com'){
  const Data = {
    data: "<incident><name>"+title+"</name><priority>Low</priority><requester><email>samanage_api@dpr.com</email></requester><description>"+details+"</description><assignee_id>1786115</assignee_id><custom_fields_values><custom_fields_value><name>Origin</name><value>Chat</value></custom_fields_value></custom_fields_values></incident>"

}
const holdresponse = axios.post(BASE_URL, Data, Config)
.then((response) => {
    console.log('Successfully made new incident POST call\n');
  }, (error) => {
    console.log(error);
  });

return holdresponse;

}else{
    const Data = {
        data: "<incident><name>"+title+"</name><priority>Low</priority><requester><email>ITService@dr.com</email></requester><description>"+details+"</description><assignee><email>"+assignee+"</email></assignee><custom_fields_values><custom_fields_value><name>Origin</name><value>Chat</value></custom_fields_value></custom_fields_values></incident>"
    
    }
    const holdresponse = axios.post(BASE_URL, Data, Config)
    .then((response) => {
        console.log('Successfully made new incident POST call\n');
      }, (error) => {
        console.log(error);
      });

    return holdresponse;
  }

 
}


module.exports.postNewIncident = postNewIncident;


