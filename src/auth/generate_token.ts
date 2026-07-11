import { getOAuth2Client } from './oauth.js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/documents'
];

async function generateToken() {
  const client = getOAuth2Client();

  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force consent to ensure we get a refresh token
  });

  console.log('\n======================================================');
  console.log('1. Open this URL in your browser:');
  console.log('\n', authUrl, '\n');
  console.log('2. Authorize the application.');
  console.log('3. Since your redirect URI is "http://localhost", your browser will likely fail to load the final page. That is normal!');
  console.log('4. Look at the URL in your browser address bar. It will look something like:');
  console.log('   http://localhost/?code=4/0AeaY...&scope=...');
  console.log('5. Copy the value of the "code" parameter.');
  console.log('======================================================\n');

  const rl = readline.createInterface({ input, output });
  const code = await rl.question('Enter the code here: ');
  rl.close();

  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    // The oauth.ts event listener 'tokens' will automatically save it to .tokens.json
    console.log('\n✅ Successfully generated and saved tokens to .tokens.json!');
  } catch (err) {
    console.error('\n❌ Error retrieving access token. Did you copy the code correctly?');
    console.error(err);
  }
}

generateToken();
