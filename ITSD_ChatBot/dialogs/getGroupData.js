const axios = require("axios");


//API call using Axios that will pull the (currently) 5 SD users --TODO-- automate this. This is hard coded using a SWSD filter

function getGroupData() {

  const Headers = {
   headers: {
   "X-Samanage-Authorization": "Bearer SmFtZXNCZUBkcHIuY29t:eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyX2lkIjozMzQ1Njc1LCJnZW5lcmF0ZWRfYXQiOiIyMDIwLTA0LTE2IDE3OjUzOjQ1In0.-4nMJ2AQQt1ESgif5VLzc4MBbck9QN0FUIBrPx4JXF9pyzPOX1KKQsR51eXJuHq6uHTyjSqfQnvuC9uKT6-QZQ",
   "Accept": "application/json"
  }
};

  const USER_URL =  "https://dprconstruction.samanage.com/incidents?report_id=8992193&applied=true&title%5B%5D=*Placeholder%20to%20populate%20API%20Call*&sort_by=number&sort_order=DESC&columns=number%2Cstate%2Cpreview%2Ctitle%2Ccreated_at_with_time%2Ctype%2Csub_type%2Cassigned_to%2Crequester%2Cpriority%2Cslm%2Ccustomer_satisfied%3F"

  console.log("Got to getgroup data")
  
  var holdGroupMembers = axios.get(USER_URL, Headers)

  //Removed code to speed up process of obtaining SD Personnel
  /*
  .then((response) => {
    console.log('Successfully made GET call\n');
    console.log("This is the response " + response.data)
    return response.data
  }, (error) => {
    console.log(error);
  });
  */

  console.log("This is the holdgroup members object " +holdGroupMembers)
   return holdGroupMembers;
}


//API call using Axios that will pull the 50 most recent incidents created today and send this back for processing

function getRecentIncident(){

  const Headers = {
    headers: {
    "X-Samanage-Authorization": "Bearer SmFtZXNCZUBkcHIuY29t:eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyX2lkIjozMzQ1Njc1LCJnZW5lcmF0ZWRfYXQiOiIyMDIwLTA0LTE2IDE3OjUzOjQ1In0.-4nMJ2AQQt1ESgif5VLzc4MBbck9QN0FUIBrPx4JXF9pyzPOX1KKQsR51eXJuHq6uHTyjSqfQnvuC9uKT6-QZQ",
    "Accept": "application/json"
   }
};


    const TICKETS_URL = "https://dprconstruction.samanage.com/incidents?report_id=8992193&applied=true&created%5B%5D=1&assigned_to%5B%5D=1784743&assigned_to%5B%5D=3518814&assigned_to%5B%5D=3574680&assigned_to%5B%5D=4498568&assigned_to%5B%5D=5763508&sort_by=created_at&sort_order=DESC&columns=number%2Cstate%2Cpreview%2Ctitle%2Cupdated_at_with_time%2Ccreated_at_with_time%2Cassigned_to%2Crequester%2Cpriority%2Cslm&per_page=50&page=1"
  
     //Make get call to SWSD to obtain each user's most recently updated incident
     var updatedIncidentData = axios.get(TICKETS_URL, Headers)

     return updatedIncidentData;
}




//Function that accepts the current list of SD personnel and the Agents placeholder to send back to main dialog.
//This Function checks the current time and date to the schedules and SWSD activity of the acquired SD personnel

function getActiveMembers(members, Agent){

  var indexHolder = 0;

  
for(var i=0;i<members.length;i++){  //Iterate through all members of the SD group in "members"



  
//Get system local time to check against SD User's schedules
  var d = new Date();
  var today = d.getDate();
  var m = d.getMinutes();
  var h = d.getHours();



 //h = h+5;  // << Time adjustment for local testing adjust to UTC
  
  var currentTime = h+"."+m;  //Make time a number that can be compared


  //Check if the chat time was put in during the member at position "i"'s schedule (Hard coded schedules --TODO-- Automate this

  if(members[i].name == 'Grayson Livingston') {

    if(currentTime > 12.00 && currentTime < 21.00){    //If between 7-4 (UTC time) -- Its Grayson's scheduled time
      if(Agent.recentUpdate[2]==today){                 //If the most recently updated incident was updated today for this user -- they are available

      console.log("Grayson is available has been assigned a ticket today");
      Agent.name[indexHolder] = members[i].name;
      Agent.email[indexHolder] = members[i].email;
      Agent.id[indexHolder] = members[i].group_id;
      Agent.image[indexHolder] = members[i].avatar.avatar_url; 
    
         indexHolder = indexHolder + 1;

    }
    }

  }

    //Removed Justin from populating in the Agents variable -- he is moving to ITFE
    //TODO -- replace with new member(s)

  /*
  if(members[i].name == 'Justin Hagerman') {          

    if(currentTime > 12.00 && currentTime < 21.00){         //If between 7-4 (UTC time) -- Its Justin's scheduled time
      if(Agent.recentUpdate[1] == today){                   //If the most recently updated incident was updated today for this user -- they are available
      
        console.log("Justin is available has been assigned a ticket today");
        Agent.name[indexHolder] = members[i].name;
        Agent.email[indexHolder] = members[i].email;
        Agent.id[indexHolder] = members[i].group_id;
        Agent.image[indexHolder] = members[i].avatar.avatar_url; 
      
           indexHolder = indexHolder + 1;

        
      }
    }

  }
*/


  if(members[i].name == 'Michael Mooney') {          

    if(currentTime > 13.00 && currentTime < 22.00){         //If between 8-5 (UTC time) -- Its Michael's scheduled time
      if(Agent.recentUpdate[3] == today){                    //If the most recently updated incident was updated today for this user -- they are available

        console.log("Michael is available has been assigned a ticket today");
        Agent.name[indexHolder] = members[i].name;
        Agent.email[indexHolder] = members[i].email;
        Agent.id[indexHolder] = members[i].group_id;
        Agent.image[indexHolder] = members[i].avatar.avatar_url; 
      
           indexHolder = indexHolder + 1;

        
      }
    }

  }

  if(members[i].name == 'Collin Cherry') {

    if(currentTime > 15.00 && currentTime < 24.00){               //If between 10-7 (UTC time) -- Its Collin's scheduled time
      if(Agent.recentUpdate[0] == today){                         //If the most recently updated incident was updated today for this user -- they are available

        console.log("Collin is available has been assigned a ticket today");
        Agent.name[indexHolder] = members[i].name;
        Agent.email[indexHolder] = members[i].email;
        Agent.id[indexHolder] = members[i].group_id;
        Agent.image[indexHolder] = members[i].avatar.avatar_url; 

        console.log("This is Collins image URL " + members[i].avatar.avatar_url)
      
           indexHolder = indexHolder + 1;

        
      }
    }

  }

  if(members[i].name == 'James Bell') {

    if(currentTime > 15.00 && currentTime < 24.00){              //If between 10-7 (UTC time) -- Its James's scheduled time
      if(Agent.recentUpdate[4] == today){                       //If the most recently updated incident was updated today for this user -- they are available

        console.log("James is available and has been assigned a ticket today");
        Agent.name[indexHolder] = members[i].name;
        Agent.email[indexHolder] = members[i].email;
        Agent.id[indexHolder] = members[i].group_id;
        Agent.image[indexHolder] = members[i].avatar.avatar_url; 
      
           indexHolder = indexHolder + 1;


        
      }
    }

  }

 

}




  return Agent;  //Return the Agent placeholder for processing
}


module.exports.getRecentIncident = getRecentIncident;
module.exports.getActiveMembers = getActiveMembers;
module.exports.getGroupData = getGroupData;