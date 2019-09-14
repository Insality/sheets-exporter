const settings = require("../settings")
const fs = require("fs")
const path = require("path")
const readline = require('readline')
const {google} = require('googleapis')
const opn = require("opn")

const SCOPES = [settings.google_scopes]
const AUTH_DIR = path.join(__dirname, "..", settings.auth_dir)
const TOKEN_PATH = path.join(AUTH_DIR, settings.token_name)
const CREDENTIALS_PATH = path.join(AUTH_DIR, settings.credentials_name)


function getNewToken(oAuth2Client, callback) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	})

	console.log('Authorize this app by visiting this url:', authUrl)
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})
	opn(authUrl)

	rl.question('Enter the code from that page here: ', (code) => {
		rl.close()
		oAuth2Client.getToken(code, (err, token) => {
			if (err) return console.error('Error while trying to retrieve access token', err)
			oAuth2Client.setCredentials(token)
			// Store the token to disk for later program executions
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
				if (err) console.error(err)
				console.log('Token stored to', TOKEN_PATH)
			})
		callback(oAuth2Client)
		})
	})
}

function authorize(credentials, callback) {
	const {client_secret, client_id, redirect_uris} = credentials.installed
	const oAuth2Client = new google.auth.OAuth2(
		client_id, client_secret, redirect_uris[0])

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, (err, token) => {
		if (err) return getNewToken(oAuth2Client, callback)
		oAuth2Client.setCredentials(JSON.parse(token))
		callback(oAuth2Client)
	})
}

// Load client secrets from a local file.
function auth(callback) {
	fs.readFile(CREDENTIALS_PATH, (err, content) => {
		if (err) return console.log('Error loading client secret file:', err)
		// Authorize a client with credentials, then call the Google Sheets API.
		authorize(JSON.parse(content), callback)
	})	
}

exports.auth = auth