# **<p align="center">Chatbot</p>**
## **<p align="center">A Microsoft BotFramwork bot hosted in Azure and written in Node.js</p>**

### Design

1. Deployed to Azure for dynamic deployment across multiple applications/web interfaces
   - Hosted primarily in Microsoft Teams
2. Written in Node.JS with JSON formatting files
3. Structured as a "Waterfall" dialog system with asynchronous function calls to pause flow and begin processing
4. LUIS is integrated, but implementation was deprecated for rollout

### Dialogs
1. Main
   - The initial and primary dialog that the Bot runs on
   - Waterfall begins, ends and loops through this dialog
2. AccessDialog.js

CloseIncidentDialog.js

CreateChatIncidentDialog.js

POSTChatIncident.js

POSTNewChatIncident.js

POSTNewIncident.js

ReassignIncidentDialog.js

SolutionDialog.js

UpdateIncident.js

cancelAndHelpDialog.js

dateResolverDialog.js

getGroupData.js

incidentRecognizer.js
