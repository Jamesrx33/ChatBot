const axios = require("axios");

function postNewChatIncident(requester, priority, details) {
    const BASE_URL = `https://api.samanage.com/incidents.xml`
  
    const Config = {
        headers: {
        "X-Samanage-Authorization": "Bearer TOKEN",
        "Accept": "application/xml",
        "Content-Type": "text/xml"
       },
    };
  
    const Data = {
        data: "<incident><name>ITService ChatBot Incident</name><priority>"+priority+"</priority><requester><email>"+requester+"</email></requester><description>"+details+"</description><custom_fields_values><custom_fields_value><name>Origin</name><value>Assistant</value></custom_fields_value></custom_fields_values></incident>"
  
    }
    const holdresponse = axios.post(BASE_URL, Data, Config)
    .then((response) => {
        console.log('Successfully made new incident POST call\n');
        return response;
      }, (error) => {
        console.log(error);
        return false;
      });
  
    return holdresponse;
  
  
  }

  module.exports.postNewChatIncident = postNewChatIncident;
