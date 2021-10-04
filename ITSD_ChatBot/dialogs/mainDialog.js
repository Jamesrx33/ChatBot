const { MessageFactory, InputHints, CardFactory, ShowTypingMiddleware} = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, ConfirmPrompt, WaterfallDialog, AttachmentPrompt, NumberPrompt } = require('botbuilder-dialogs');
const axios = require("axios");
const WelcomeCard = require('./resources/welcomeCard.json');
const postChatIncident = require( "./POSTChatIncident");
const postNewChatIncident = require("./POSTNewChatIncident")
const getGroupData = require("./getGroupData");
const CONFIRM_PROMPT = 'confirmPrompt';
const postNewIncident = require( "./POSTNewIncident");
const updateIncident = require("./UpdateIncident");
const closeIncident = require("./UpdateIncident");




  //Array Available Agent for use in loadBalancer return value
  var AvailableAgent = {};


  //Initiate the IncidentDetails object for communicating with Dialogs and saving responses

  const IncidentDetails = {};
  IncidentDetails.id = '';
  IncidentDetails.name = '';
  IncidentDetails.assignee = '';
  IncidentDetails.requester = '';
  IncidentDetails.title = '';
  IncidentDetails.details = '';
  IncidentDetails.type = '';

  //Declare Agent object.
  //This will be used to store agent information 
  //Agent informaton will be sent to the loadBalancer method to find the next available Agent based on Chats received in last 24 hours

  var Agent = {};
  Agent.name = [];
  Agent.email = [];
  Agent.ticketCount = [];
  Agent.id = [];
  Agent.image = [];
  Agent.recentUpdate = [new Date()];





const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

class MainDialog extends ComponentDialog {
    constructor(luisRecognizer, accessDialog, solutionDialog, createChatIncidentDialog, reassignIncidentDialog, closeIncidentDialog) {
        super('MainDialog');

        if (!luisRecognizer) throw new Error('[MainDialog]: Missing parameter \'luisRecognizer\' is required');

        this.luisRecognizer = luisRecognizer;

        if (!accessDialog) throw new Error('[MainDialog]: Missing parameter \'accessDialog\' is required');

        if (!solutionDialog) throw new Error('[MainDialog]: Missing parameter \'solutionDialog\' is required');

        if (!createChatIncidentDialog) throw new Error('[MainDialog]: Missing parameter \'createChatIncidentDialog\' is required');

        if (!reassignIncidentDialog) throw new Error('[MainDialog]: Missing parameter \'reassignIncidentDialog\' is required');

        if (!closeIncidentDialog) throw new Error('[MainDialog]: Missing parameter \'closeIncidentDialog\' is required');

        // Define the main dialog and its related components.

        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(accessDialog)
            .addDialog(solutionDialog)
            .addDialog(createChatIncidentDialog)
            .addDialog(reassignIncidentDialog)
            .addDialog(closeIncidentDialog)
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.introStep.bind(this),
                this.actStep.bind(this),
                this.selectStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();

        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * First step in the waterfall dialog. Prompts the user for a command.
     * Currently, this will send a "What can we help you with today" prompt after the welcome card.
     */
    async introStep(stepContext) {

      console.log("Ping Intro")
      try {
        
        //Check if Luis is configured
        if (!this.luisRecognizer.isConfigured) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await stepContext.next();
        }

        console.log("Session: %O", stepContext.context.activity);

        //If IntroStep finds the "Restart Message" option -- send the Welcome Card
        if(stepContext.options.restartMsg){

          console.log("Session: %O", stepContext.options);

        // get system local time
        var d = new Date();
        var m = d.getMinutes();  //Pull Minutes from time
        var s = d.getSeconds();  //Pull Seconds from time
        var wait = 1.20;          //Establish the wait time variable for delay on restarts
        var timeThen = m+"."+s;  //Put current time into timeThen variable
        var timeNow = timeThen;  //Set timeNow as timeThen -- initializes timeNow


        if(!stepContext.options.resetNow){                                                             //If "resetNow" is false -- reset dialog in 60 sec
        //Loop until 60 seconds pass -- this loop is known to end early -- TODO, why?
        while(timeNow != 0)
       {
         
        var d = new Date();
        var m = d.getMinutes();
        var s = d.getSeconds();

        timeNow = m+'.'+s
        if(timeNow-timeThen > wait){
                                    //Wait about 30 seconds before sending the new welcome card or 5 seconds for solution reset
              break;
          }
      }

          //Send WelcomeCard (stored in restart value)
          await stepContext.context.sendActivity({ attachments: [stepContext.options.restartMsg] });
          //Call obtainCardResponse function to await for card button press
          return await this.obtainCardResponse(stepContext);

    }else{                                                                                               //If "resetNow" is true -- reset dialog immediately
          //Send WelcomeCard (stored in restart value)
          stepContext.context.activity.value = {};
          stepContext.context.activity.value.id = 'Chat with IT';
          //Call obtainCardResponse function to await for card button press
          return await stepContext.next();
    }

        }else if(stepContext.context.activity.type == 'conversationUpdate'){
         return await this.obtainCardResponse(stepContext);
        }else{
          //Always await response from card regardless of stepcontext
         return await this.obtainCardResponse(stepContext);
        }
      } catch (error) {
        console.log(error) // error checking
      }
    }

    /**
     * Second step in the waterfall.  This will accept button activity from previous step and call respective dialogs
     */
    async actStep(stepContext) {
      console.log("Ping Act Step")

      var actionToTake = ''; //Holds action from previous step to place into Switch

      //Check to be sure there was button activity prior to getting to this step -- display it in console
      if(stepContext.context.activity.value){
      console.log("This was the identified ID value: "+stepContext.context.activity.value.id)
        
      //Identify if any of the three buttons were pressed
      if(stepContext.context.activity.value.id == 'Chat with IT' || stepContext.context.activity.value.id == 'Access' || stepContext.context.activity.value.id == 'Solutions')
        {
        actionToTake = stepContext.context.activity.value.id;
        }
      }else{

        // If a button was not pressed, but activity was found -- assume it was a message for Luis to parse
        // Call LUIS and Intent. (Note the TurnContext has the response to the prompt)
        // This section is current deprecated -- but keeping it for future use.
      try {
        const luisResult = await this.luisRecognizer.executeLuisQuery(stepContext.context);
        actionToTake = LuisRecognizer.topIntent(luisResult);
      } catch (error) {
        console.log(error); //Catch errors on Luis call
      }
    }


        //Switch to catch actionToTake, Dialog will route to the correct action. 
        //Defaults to "I didnt unserstand that" if intent not identified
    
        switch (actionToTake) {
        case 'Cancel' : {
            //This will end session on a Cancel intent
            //*******************Deprecated LUIS Intent*****************

            const cancelMessageText = 'I have identified that you want to Cancel. Closing dialog. If you wish to continue, type another phrase.';
            await stepContext.context.sendActivity(cancelMessageText, cancelMessageText, InputHints.IgnoringInput);
            
            return await stepContext.cancelAllDialogs();

        } 
        case 'Reassign_Ticket' : {
            //This will start a dialog that requests information for the incident on a Reassign Incident intent
            //***************Deprecated LUIS Intent******************

        //Now that LUIS has identified the Reassign Incident intent - need to send a call to an async function that returns user input
        IncidentDetails.type = "Reassign";
        const reassign_messageText = 'I have identified that you want to Reassign a ticket.';
        await stepContext.context.sendActivity(reassign_messageText, reassign_messageText, InputHints.IgnoringInput);

       // console.log(stepContext.context);


        //What i need: begin dialog for user, await return of info from user, then make a POST API call
        return await stepContext.beginDialog('reassignIncidentDialog', IncidentDetails);
      } 
      case 'Access': {
        //This will start a dialog that requests information for the incident on a Create Ticket intent

        //Now that LUIS has identified the Create Ticket intent - need to send a call to an async function that returns user input
        IncidentDetails.type = "Access";

        const access_messageText = 'I see you need access to an application or a license.';
        await stepContext.context.sendActivity(access_messageText, access_messageText, InputHints.IgnoringInput);



        //Call the Access Dialog -- this will return StepContext with result options for use in the Select Step
        return await stepContext.beginDialog('accessDialog', IncidentDetails);
    } 
    case 'Solutions': {
      //This will start a dialog that requests information for the incident on a Create Ticket intent

      //Now that LUIS has identified the Create Ticket intent - need to send a call to an async function that returns user input
      IncidentDetails.type = "Solutions";

      const solutions_messageText = "Sure! I'll help you search for a solution.";
      await stepContext.context.sendActivity(solutions_messageText, solutions_messageText, InputHints.IgnoringInput);



        //Call the Solution Dialog -- this will return StepContext with result options for use in the Select Step
        return await stepContext.beginDialog('solutionDialog', IncidentDetails);
  } 
    case 'Close_Ticket' : {
        //This will start a dialog that requests information for the incident on a Close Incident intent
        //*********Deprecated LUIS Intent**********

        //Now that LUIS has identified the Close Incident intent - need to send a call to an async function that returns user input
        IncidentDetails.type = "Close";
        const close_messageText = 'I have identified that you want to Close an Incident.';
        await stepContext.context.sendActivity(close_messageText, close_messageText, InputHints.IgnoringInput);


        //What i need: begin dialog for user, await return of info from user, then make a POST API call
        return await stepContext.beginDialog('closeIncidentDialog', IncidentDetails);

  } 
        case 'Chat with IT':
        case 'Chat': {


           


          //Adapting "Chat" to just generate a ticket -- removing time requirement

          console.log("Made it to Chat")
  // get system local time
  var d = new Date();
  var m = d.getMinutes();
  var h = d.getHours();
  var dayOfTheWeek = d.getDay();

 // h = h+6;   //<< Time adjustment for local testing (Adjust to UTC)



  var currentTime = h+"."+m;  //Set currentTime varlaiable as a number -- this will ensure "Contact IT" was selected within business hours



  if(dayOfTheWeek == 0 || dayOfTheWeek == 6){ //Check if its Sunday or Saturday -- reset chat if it is

    //Send Out of Business hours message and reset chat
    const Chat2_messageText = 'I apologize, but ITService can only be contacted via phone on the weekends. Please call 888-377-2030 or try again Mon-Fri from 5am-5pm PDT.';
    await stepContext.context.sendActivity(Chat2_messageText, Chat2_messageText, InputHints.IgnoringInput);
    const Chat_messageText = 'Chat will restart soon.';
    await stepContext.context.sendActivity(Chat_messageText, Chat_messageText, InputHints.IgnoringInput);

    const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
    stepContext.context.activity.value = null;

    //Replace current dialog with welcomeCard
    return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: welcomeCard});

  }

  else{

 
        IncidentDetails.type = 'ChatIncident';
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: '***Do you need immediate assistance?***' });
}
        }
        default: {
            // Catch all for unhandled intents or actions
            const didntUnderstandMessageText = `Sorry, I didn't get that. Please try another selection or phrase.`;
            await stepContext.context.sendActivity(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.IgnoringInput);
        }
      }
            return await stepContext.next();  //Move to the next step in the waterfall
 
    }


async selectStep(stepContext){
  console.log("Ping Select Step")

  console.log("stepContext.result in select step is: %O", stepContext.result)

  if(stepContext.result){


  if(stepContext.result == true && stepContext.result.name!=''){



    //POST Chat incident to the identified personnel for tracking of assigned Chat incidents
    try {

      IncidentDetails.priority = "High";

    //Begin dialog for user, await return of info from user, then make a POST API call
    return await stepContext.beginDialog('createChatIncidentDialog', IncidentDetails);


   } catch (error) {
       console.log(error); //Error checking on postChatIncident function call (POST AXIOS function)
   }


   

  const ChatCard = CardFactory.adaptiveCard({
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.0",
    "body": [
      {
        "type": "TextBlock",
        "weight": "bolder",
        "size": "medium",
        "wrap": true,
        "text": `Click this button to start a chat with IT`
      }
    ],
    "actions": [
      {
        "type": "Action.OpenUrl",
        "title": "Start a Chat",
        "url": "https://teams.microsoft.com/l/chat/0/0?users=ITService@dpr.com,Jamesbe@dpr.com,Collinc@dpr.com,GraysonLi@dpr.com,Michaelmo@dpr.com&topicName=New%20ITService%20Chat%20From%20Bot&message=Hello%2C%20I%20need%20assistance%20please"
      }
    ]
  });



const Chatmessage = MessageFactory.attachment(ChatCard);
const LinkCard = await stepContext.context.sendActivity(Chatmessage);

  

return await stepContext.next();



  }else if(stepContext.result.result == 'No' && stepContext.result.type == 'Access'){

    const Chat2_messageText = "Sorry we couldn't find what you were looking for. Let me get you in touch with an ITService agent.";
    await stepContext.context.sendActivity(Chat2_messageText, Chat2_messageText, InputHints.IgnoringInput);

    const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
    stepContext.context.activity.value = null;

  //Always replace current dialog with welcomeCard
  const resetNow = true;
    return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: welcomeCard, resetNow: resetNow });

  }else if(stepContext.result.result == 'No' && stepContext.result.type == 'Solution'){

    const Chat2_messageText = "Sorry we couldn't find what you were looking for. Let me get you in touch with an ITService agent.";
    await stepContext.context.sendActivity(Chat2_messageText, Chat2_messageText, InputHints.IgnoringInput);

    const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
    stepContext.context.activity.value = null;

  //Always replace current dialog with welcomeCard
  const resetNow = true;
    return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: welcomeCard, resetNow: resetNow });

  }else{
    return await stepContext.next();
  }
}else if(IncidentDetails.type == 'ChatIncident'){

  IncidentDetails.priority = "Low";
  //Begin dialog for user, await return of info from user, then make a POST API call
  return await stepContext.beginDialog('createChatIncidentDialog', IncidentDetails);

}else{
  return await stepContext.next();
}
}


    
    async finalStep(stepContext) {

      console.log("Ping Final Step")

console.log("This is what is in stepContext " + stepContext.result)

      //If stepContext finds data (Incident creations processes) -- Post incident

      if(stepContext.result){
      const result = stepContext.result;
      console.log(result.type);

      
      if(result.type == 'Access'){
      
          const msg = result.name + ` forms were sent.`;
          await stepContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);
 

    }else if(IncidentDetails.type == 'ChatIncident'){
 
    }else if(result.type == 'Solution'){
      
      const msg = result.name + ` forms were sent.`;
      await stepContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);
}



    else{
      const msg = "No action type found. Please try again.";
      await stepContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);

    }
  }


      //Indicate the chat is restarting
      const mesg = "Thank you for using the ITService Assistant! Please wait as i route you back to the main menu.";
      await stepContext.context.sendActivity(mesg, mesg, InputHints.IgnoringInput);

      const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);


    //Always replace current dialog with WelcomeCard at waterfall end
      return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: welcomeCard });
  
    }

async obtainDataFromPromise (promise){

  return promise.data;
  }



async obtainAssigneeFromPromise (promise){
var assignee = [];
for(var i=0; i<promise.length; i++){
  assignee[i]=promise[i].assignee
console.log(promise[i].assignee.name + " Placed in asignee variable")
}
return assignee;
}




async obtainIncidentFromPromise (promise, agent, groupData){
var pass = [0,0,0,0,0];

for(var i=0; i<promise.data.length; i++){
  if(promise.data[i].assignee.name == groupData[0].name && pass[0] != 1){

    agent.recentUpdate[0]=promise.data[i].created_at
    console.log(promise.data[i].created_at + " into " + groupData[0].name + " array variable.")
    pass[0] = 1;

  }else if(promise.data[i].assignee.name == groupData[1].name && pass[1] != 1){

    agent.recentUpdate[1]=promise.data[i].created_at
    console.log(promise.data[i].created_at + " into " + groupData[1].name + " array variable.")
    pass[1] = 1;

  }else if(promise.data[i].assignee.name == groupData[2].name && pass[2] != 1){

    agent.recentUpdate[2]=promise.data[i].created_at
    console.log(promise.data[i].created_at + " into " + groupData[2].name + " array variable.")
    pass[2] = 1;

  }else if(promise.data[i].assignee.name == groupData[3].name && pass[3] != 1){

    agent.recentUpdate[3]=promise.data[i].created_at
    console.log(promise.data[i].created_at + " into " + groupData[3].name + " array variable.")
    pass[3] = 1;

  }else if(promise.data[i].assignee.name == groupData[4].name && pass[4] != 1){

    agent.recentUpdate[4]=promise.data[i].created_at
    console.log(promise.data[i].created_at + " into " + groupData[4].name + " array variable.")
    pass[4] = 1;

  }

  console.log("Processing next ticket..." + i)
}
return agent;
}



//
//
//This function is designed to await specific Welcomecard activity -- it is called at every intro step
//
//

async obtainCardResponse(stepContext){

if(stepContext.context.activity.value){
  console.log("The activity has an value of " + stepContext.context.activity.value)
    console.log("Caught button action and returning value")
    const Cardcontext = stepContext
    return Cardcontext.next();
}else{
  const Chat_messageText = 'Please select an option in the welcome card.';
  await stepContext.context.sendActivity(Chat_messageText, Chat_messageText, InputHints.IgnoringInput);
  return stepContext;
}
}


}



module.exports.MainDialog = MainDialog;
