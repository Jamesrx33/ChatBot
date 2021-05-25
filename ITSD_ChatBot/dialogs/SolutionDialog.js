const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory, CardFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';


class SolutionDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'solutionDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.nameStep.bind(this),
                this.sendStep.bind(this),
                this.confirmStep.bind(this),
                this.endStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * What is the name of the application they need access to?
     */
    async nameStep(stepContext) {
        const incidentDetails = stepContext.options;

        if (incidentDetails.name == '' || stepContext.options.restartMsg == 'restart') {
            const messageText = 'Could you please provide a short description of the issue?';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(incidentDetails.name);
    }

    /**
     * Send adaptive card with the URL appended with the name of the application they input
     */
    async sendStep(stepContext) {
        const incidentDetails = stepContext.options;

        // Capture the results of the previous step
        incidentDetails.name = stepContext.result;

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
                "text": "Here are some solutions that may be able to assist you:"
              }
            ],
            "actions": [
              {
                "type": "Action.OpenUrl",
                "title": "Solutions",
                "url": `https://dprconstruction.samanage.com/solutions.portal?page=1&report_id=9097623&query=${incidentDetails.name}`
              }
            ]
          });
        
        
        const Chatmessage = MessageFactory.attachment(ChatCard);
        const LinkCard = await stepContext.context.sendActivity(Chatmessage);
        return await stepContext.next(incidentDetails.type);
    }

    /*
     * Confirm that the user was able to get what they needed from the link
     */
    async confirmStep(stepContext) {
        const incidentDetails = stepContext.options;

        // Capture the results of the previous step
        incidentDetails.type = 'Solution';


        const msg2 = `Did you find what you were looking for?`;
        const msg = MessageFactory.text(msg2, msg2, InputHints.ExpectingInput);

        // Offer a YES/NO prompt.
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    }


    /**
     * Complete the interaction and end the dialog.
     */
    async endStep(stepContext) {
        if (stepContext.result === true) {
            const incidentDetails = stepContext.options;
            return await stepContext.endDialog(incidentDetails);
        }else if(stepContext.result == false){
            stepContext.options.result = 'No';
            const incidentDetails = stepContext.options;
            return await stepContext.endDialog(incidentDetails);
        }
        return await stepContext.endDialog();
    }

    isAmbiguous(timex) {
        const timexPropery = new TimexProperty(timex);
        return !timexPropery.types.has('definite');
    }
}

module.exports.SolutionDialog = SolutionDialog;
