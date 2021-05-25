const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');
const POSTNewChatIncident = require('./POSTNewChatIncident');

const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';


class CreateChatIncidentDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'createChatIncidentDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.requesterStep.bind(this),
                this.detailsStep.bind(this),
                this.confirmStep.bind(this),
                this.endStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Who should the incident be assigned to?
     */
    async requesterStep(stepContext) {
        const incidentDetails = stepContext.options;

        if (incidentDetails.requester == '' || stepContext.options.restartMsg == 'restart') {
            const messageText = 'Please enter your work email address.';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(incidentDetails.requester, incidentDetails.priority);
    }

    /**
     * Obtain the details of the incident. 
     */

    async detailsStep(stepContext) {
        const incidentDetails = stepContext.options;

        // Capture the results of the previous step
        incidentDetails.requester = stepContext.result;

        if (incidentDetails.details == '' || stepContext.options.restartMsg == 'restart') {
            const messageText = 'Please describe the issue or request.';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(incidentDetails.details, incidentDetails.priority);
    }

    /**
     * Confirm the information the user has provided.
     */
    async confirmStep(stepContext) {
        const incidentDetails = stepContext.options;

        // Capture the results of the previous step
        incidentDetails.details = stepContext.result;
        
        const msg1 = `Just to make sure, I have your email as: ${ incidentDetails.requester } `;
        await stepContext.context.sendActivity(msg1, msg1, InputHints.IgnoringInput);
        const msg2 = `And are looking for assistance with: \n\n ${ incidentDetails.details } `;
        await stepContext.context.sendActivity(msg2, msg2, InputHints.IgnoringInput);
        const msg3 = `***WARNING***, If your email is not written correctly, the ticket will not be created.\n\n`;
        await stepContext.context.sendActivity(msg3, msg3, InputHints.IgnoringInput);
        const messageText = `Is this correct?`;
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);


        // Offer a YES/NO prompt.
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    }


    /**
     * Complete the interaction and end the dialog.
     */
    async endStep(stepContext) {
        if (stepContext.result === true) {
            const incidentDetails = stepContext.options;
            console.log("This is the assignee " + incidentDetails.assignee)
            const returncode = await POSTNewChatIncident.postNewChatIncident(incidentDetails.requester, incidentDetails.priority, incidentDetails.details);   
            const promiseData = await obtainDataFromPromise(returncode)
            
            if (promiseData != 200)
            {
                const msg1 = `There was an issue creating your ticket, please input your email and details of the issue once more. Example of valid input:\n\nEmail: Jamesbe@dpr.com\n\nDetails: Bluebeam wont open`;
                await stepContext.context.sendActivity(msg1, msg1, InputHints.IgnoringInput);
                return await stepContext.replaceDialog(this.initialDialogId, {restartMsg: 'restart', assignee: incidentDetails.assignee});
            }else{
                const msg = `Your incident was successfully created and assigned to ITService.`;
                await stepContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);
            return await stepContext.endDialog(incidentDetails);
            }
        }else if(stepContext.result == false){
            const incidentDetails = stepContext.options;
            console.log("This is the assignee " + incidentDetails.assignee)
            return await stepContext.replaceDialog(this.initialDialogId, {restartMsg: 'restart', assignee: incidentDetails.assignee});
        }
        return await stepContext.endDialog();
    }

    isAmbiguous(timex) {
        const timexPropery = new TimexProperty(timex);
        return !timexPropery.types.has('definite');
    }
}



function obtainDataFromPromise (promise){
    console.log(promise);
    return promise.status;
    }

module.exports.CreateChatIncidentDialog = CreateChatIncidentDialog;
