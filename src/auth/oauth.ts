import { google, Auth } from 'googleapis';
import dotenv from 'dotenv';
import { loadSavedTokens, saveTokens } from './token_store.js';

dotenv.config();

// Define required scopes for Gmail and Google Docs
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/documents'
];

let oAuth2Client: Auth.OAuth2Client | null = null;

/**
 * Initializes the OAuth2Client with credentials from environment variables.
 */
export function getOAuth2Client(): Auth.OAuth2Client {
  if (oAuth2Client) {
    return oAuth2Client;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in environment variables.');
  }

  oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  // Set up an event listener to automatically save tokens when they are refreshed
  oAuth2Client.on('tokens', (tokens) => {
    // Merge new tokens with potentially existing ones (e.g. refresh token)
    loadSavedTokens().then((existingTokens) => {
      const updatedTokens = { ...existingTokens, ...tokens };
      saveTokens(updatedTokens).catch(err => {
        console.error('Failed to save refreshed tokens:', err);
      });
    }).catch(err => {
       console.error('Failed to load existing tokens for merge:', err);
    });
  });

  return oAuth2Client;
}

/**
 * Ensures the OAuth client is authenticated. Tries to load saved tokens.
 * Throws an error with instructions if authentication is required.
 */
export async function getAuthenticatedClient(): Promise<Auth.OAuth2Client> {
  const client = getOAuth2Client();

  // Try to load saved tokens if they haven't been set on the client
  const savedTokens = await loadSavedTokens();
  if (savedTokens) {
    client.setCredentials(savedTokens);
    return client;
  }

  // If no tokens are found, generate the auth URL to instruct the user
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force consent to ensure we get a refresh token
  });

  throw new Error(`Authentication required. Please authorize the application by visiting this URL:\n${authUrl}\n\nAfter authorization, obtain the code and implement a way to call client.getToken(code).`);
}
