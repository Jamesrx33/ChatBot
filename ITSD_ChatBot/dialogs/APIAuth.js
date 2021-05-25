const { UserAgentApplication } = require("msal");

const { ImplicitMSALAuthenticationProvider } = require("@microsoft/microsoft-graph-client/lib/src/ImplicitMSALAuthenticationProvider");
const { MSALAuthenticationProviderOptions } = require('@microsoft/microsoft-graph-client/lib/src/MSALAuthenticationProviderOptions');


// An Optional options for initializing the MSAL @see https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL-basics#configuration-options
const msalConfig = {
	auth: {
		clientId: "dac4ebbe-dfde-4487-80ce-0850f72034e3", // Client Id of the registered application
		redirectUri: "https://botteamsadoption.azurewebsites.net/Graph_Auth",
	},
};
const graphScopes = ["User.ReadBasic.All",
	"User.Read.All",
	"Directory.Read.All",
	"User.ReadWrite.All",
	"Directory.ReadWrite.All",
	"Directory.AccessAsUser.All",
	"GroupMember.Read.All",
	"Group.Read.All",
	"Presence.Read",
	"Presence.Read.All"]; // An array of graph scopes

// Important Note: This library implements loginPopup and acquireTokenPopup flow, remember this while initializing the msal
// Initialize the MSAL @see https://github.com/AzureAD/microsoft-authentication-library-for-js#1-instantiate-the-useragentapplication
const msalApplication = new UserAgentApplication(msalConfig);
const graph_options = new MSALAuthenticationProviderOptions(graphScopes);
const authProvider = new ImplicitMSALAuthenticationProvider(msalApplication, graph_options);

const options = {
    authProvider, // An instance created from previous step
};
const client = Client.initWithMiddleware(options);

return client;


