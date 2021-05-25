const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';


class ReassignIncidentDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'reassignIncidentDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.assigneeStep.bind(this),
                this.idStep.bind(this),
                this.confirmStep.bind(this),
                this.endStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Who should the incident be assigned to?
     */
    async assigneeStep(stepContext) {
        const incidentDetails = stepContext.options;

        if (incidentDetails.assignee == '') {
            const messageText = 'Please enter the email address of the person or group being assigned this incident. For Service Desk - put itservice@dpr.com';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(incidentDetails.assignee);
    }

    /**
     * What is the ID of the incident?
     */
    async idStep(stepContext) {
        const incidentDetails = stepContext.options;

        // Capture the results of the previous step
        incidentDetails.assignee = stepContext.result;

        if (incidentDetails.id == '') {
            const messageText_Intro = 'What is the ID of the incident?\n ***NOTE*** This is not the incident number.\n';
            await stepContext.context.sendActivity(messageText_Intro, messageText_Intro, InputHints.IgnoringInput);
            const messageText_Mid = 'This is the ID value of the incident object found in the URL of the incident.\n ';
            await stepContext.context.sendActivity(messageText_Mid, messageText_Mid, InputHints.IgnoringInput);
            const messageText = 'For instance,  with: https://dprconstruction.samanage.com/incidents/60242864-company-portal-diagnostic-information-5f932b40 -- the Incident ID is 60242864.';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(incidentDetails.id);
    }

    /**
     * Confirm the information the user has provided.
     */
    async confirmStep(stepContext) {
        const incidentDetails = stepContext.options;

        // Capture the results of the previous step
        incidentDetails.id = stepContext.result;

        const messageText_Intro = "Please confirm, I have the assignee as: "+incidentDetails.assignee+" and the ID as: "+incidentDetails.id+". Is this correct?";
        await stepContext.context.sendActivity(messageText_Intro, messageText_Intro, InputHints.IgnoringInput);
        const messageText = `***WARNING*** If the Assignee is not written in email form or the ID is incorrect, this assignment will fail.`;
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
            return await stepContext.endDialog(incidentDetails);
        }
        return await stepContext.endDialog();
    }

    isAmbiguous(timex) {
        const timexPropery = new TimexProperty(timex);
        return !timexPropery.types.has('definite');
    }
}

module.exports.ReassignIncidentDialog = ReassignIncidentDialog;
