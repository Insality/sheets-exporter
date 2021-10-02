# About install
The installation time about 5 minutes ⏱️. The Google has changed the way to auth for Google Sheets API. Now you have to create your project to get the access.

# Install
To install **sheets-exporter** use [`npm`](https://docs.npmjs.com/).
```bash
npm install -g sheets-exporter
```
The **sheets-exporter** install globally, so you can access it from anywhere via `sheets-exporter`

# Credentials
*Credentials* - is required to define from which Google project you will get access to your documents. You can share single credentials file across your project. Other users will create their own token, if they have access.

Full instructions you can see here: https://developers.google.com/drive/api/v3/quickstart/nodejs#prerequisites

It's quite massive setup, so you can follow next step-by-step instructions. (Links in the headers - is a source of instructions)

### [Create Project](https://developers.google.com/workspace/guides/create-project#create_a_new_google_cloud_platform_gcp_project)
To use **sheets-exporter**, you need a Google Cloud Platform project. This project forms the basis for creating, enabling, and using all GCP services, including managing APIs.

- Open the  [Google Cloud Console](https://console.cloud.google.com/)
- Press "Select a projects" dropdown button

![](create-project-step-1.png)

- Press "New project" button

![](create-project-step-2.png)

- Enter name of the project (you can use any name)

![](create-project-step-3.png)

- **Done!**

### [Enable Google Sheets API](https://developers.google.com/workspace/guides/create-project#enable-api)

- Open the  [Google Cloud Console](https://console.cloud.google.com/)

- Open "APIs & Services" menu

![](enable-api-step-1.png)

- Press "Enable APIs and Services" button

![](enable-api-step-2.png)

- Search for "Google Sheets" API

- Select Google Sheets API and press "Enable" button

![](enable-api-step-3.png)

- **Done!**

### [Configure the OAuth consent screen](https://developers.google.com/workspace/guides/create-credentials#configure_the_oauth_consent_screen)
- Open the  [Google Cloud Console](https://console.cloud.google.com/)

- Open "APIs & Services" menu

- Open "OAuth consent screen" menu 

![](oauth-consent-step-1.png)

- Select the "external" user type

![](oauth-consent-step-2.png)

- Fill the App information data (app name, support email, developer email)

![](oauth-consent-step-3.png)

- Press "Save and continue" next two steps (consent and test users)

- Press "Return to dashboard"

- Press "Publish app". It will prompt your, select "Agree". The your project now published and not verified.

![](oauth-consent-step-4.png)

- **Done!**

### [Create a OAuth client ID credentials](https://developers.google.com/workspace/guides/create-credentials#desktop)
- Open the  [Google Cloud Console](https://console.cloud.google.com/)

- Press "Credentials"

![](credentials-step-1.png)

- Press "Create credentials" -> "OAuth client ID"

![](credentials-step-2.png)

- Select "Desktop app" and enter any name

![](credentials-step-3.png)

- Download new *credentials.json*

![](credentials-step-4.png)

- Save credentials at credentials folder with name `credentials.json`. To see credentials folder use `sheets-exporter setup_credentials`
	- On MacOS path is: `/Users/username/Library/Application Support/sheets-exporter/credentials.json`

- **Done!**


# Token
*Token* - is your client auth token for your project. After credentials setup id done try make your the first export:
```bash
sheets-exporter export
```

If your have no current `token.json`, you will be prompted to web browser to generate your token.
- [Optional] Select your Google account, if prompted

- Google alarm you project is not verified, press "Advanced"

![](token-step-1.png)

- Press "Go to {appname} (unsafe)"

![](token-step-2.png)

- Give the access to your Google Sheets data (select the checkbox)

![](token-step-3.png)

- Copy your token and paste in the command line. The `sheets-exporter export` will prompt you for this.

![](token-step-4.png)

![](token-step-5.png)

After that the _example export_ will be started. And you can use **sheets-exporter** now with your Google sheets.


