const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';



class CloseIncidentDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'closeIncidentDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.idStep.bind(this),
                this.confirmStep.bind(this),
                this.endStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * What is the ID of the incident?
     */
    async idStep(stepContext) {
        const incidentDetails = stepContext.options;

        if (incidentDetails.id == '') {
            const messageText = 'What is the ID of the incident?\n *NOTE* This is not the incident number.\n This is the ID value of the incident object found in the URL of the incident.\n For instance: https://dprconstruction.samanage.com/incidents/60242864-company-portal-diagnostic-information-5f932b40 >> Incident ID = 60242864.';
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
        const messageText = `Please confirm, I have the ID as: ${ incidentDetails.id }. Is this correct? WARNING, If the the ID is incorrect, this incident closure will fail.`;
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

module.exports.CloseIncidentDialog = CloseIncidentDialog;
