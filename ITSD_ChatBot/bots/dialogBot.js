

const { ActivityHandler } = require('botbuilder');
// const { ITSDTeam } = require('./TeamsInfoHandler');

class DialogBot extends ActivityHandler {
    /**
     * @param {expireAfterSeconds} expireAfterSeconds
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     */
    constructor(expireAfterSeconds, conversationState, userState, dialog) {
        super();

        //var countIds = 0;
        //var activityIds = [];

        if (!expireAfterSeconds) throw new Error('[DialogBot]: Missing parameter. expireAfterSeconds is required');
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');


       // let text = turnContext.activity.text;
        this.expireAfterSeconds = expireAfterSeconds;
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.lastAccessedTimeProperty = this.conversationState.createProperty('LastAccessedTime');
        this.dialogState = this.conversationState.createProperty('DialogState');

        this.onMessage(async (context, next) => {

           // console.log(context.activity)
            console.log('Running dialog with Message Activity.');
           // console.log('Found the following ID ' + context.activity.id)

          //  activityIds[countIds] = context.activity.id
            // Run the Dialog with the new message Activity.
            await this.dialog.run(context, this.dialogState);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    /**
     * Override the ActivityHandler.run() method to save state changes and check session timeout after the bot logic completes.
     */
    async run(context) {

 /*   
        // Retrieve the property value, and compare it to the current time.
    const now = new Date();
    const lastAccess = new Date(await this.lastAccessedTimeProperty.get(context, now.toISOString()));
    if (now !== lastAccess && ((now.getTime() - lastAccess.getTime()) / 1000) >= this.expireAfterSeconds) {
        // Notify the user that the conversation is being restarted.
        console.log(context.activityIds[0])
        console.log(context.activityIds[1])
        for (let i = 0; i < activityIds.length; i++) {
            await context.deleteActivity(activityIds[i]);
        }
        await context.sendActivity("Welcome back!  Let's start over from the beginning.");

        // Clear state.
        await this.conversationState.clear(context);
    }
*/

    await super.run(context);

    // Set LastAccessedTime to the current time.
   // await this.lastAccessedTimeProperty.set(context, now.toISOString());

        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }
}

module.exports.DialogBot = DialogBot;
