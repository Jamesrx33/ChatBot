# **<p align="center">ITService Assistant</p>**
## **<p align="center">A Microsoft BotFramework Chat Bot hosted in Azure and written in Node.js</p>**

---

### Design

1. Deployed to Azure for dynamic deployment across multiple applications/web interfaces
   - Hosted primarily in Microsoft Teams
2. Written in Node.JS with JSON formatting files
3. Structured as a "Waterfall" dialog system with asynchronous function calls to pause flow and begin processing
4. LUIS is integrated, but implementation was deprecated for rollout

---
### Dialogs
1. Main
   - The initial and primary dialog that the Bot runs on
   - Waterfall begins, ends and loops through this dialog
2. AccessDialog.js
   - Dialog for handling the "Need access to an application" button
3. SolutionDialog.js
    - Dialog for handling the "Find a solution to my problem" button
4. cancelAndHelpDialog.js
   - Listener for "Cancel" intention -- routes back to root of main dialog
6. CreateChatIncidentDialog.js
   - Dialog for "Contact IT" button
   - Calls POSTNewIncident.js
5. CloseIncidentDialog.js
   - Deprecated
7. ReassignIncidentDialog.js
    - Deprecated
8. dateResolverDialog.js
    - In development
---

### Aditional JS/JSON for processing and formatting
1. getGroupData.js
   - Used to identify who is in the Service Desk and is active
   - Deprecated
2. incidentRecognizer.js
   - Used to identify workload of service desk personnel
   - Deprecated
3. POSTChatIncident.js
   - Uses an API call to POST a new incident to the SolarWinds Service Desk Queue
4. POSTNewChatIncident.js
   - Deprecated
5. POSTNewIncident.js
   - Deprecated
6. UpdateIncident.js
   - Deprecated
7. PersonnelCard.json
   - Formatting for a BotFramework Adaptive Card
   - Designed to provide information on the assignee of a Chat
   - Uses information gleaned from GET API calls to SolarWinds Service Desk
8. WelcomeCard.json
   - Formatting for a BotFramework Adaptive Card
   - "Intro" card for all new sessions
   - Contains buttons for users to interact with to proceed with dialogs
