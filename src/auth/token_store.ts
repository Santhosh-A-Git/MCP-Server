import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOKEN_PATH = process.env.TOKEN_PATH || path.join(process.cwd(), '.tokens.json');

export interface GoogleTokens {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string;
  token_type?: string | null;
  expiry_date?: number | null;
}

/**
 * Loads the saved tokens from the local file if they exist.
 */
export async function loadSavedTokens(): Promise<GoogleTokens | null> {
  try {
    if (process.env.GOOGLE_TOKENS_JSON) {
      console.log('Loading tokens from GOOGLE_TOKENS_JSON environment variable');
      return JSON.parse(process.env.GOOGLE_TOKENS_JSON) as GoogleTokens;
    }
    const content = await fs.readFile(TOKEN_PATH, 'utf-8');
    return JSON.parse(content) as GoogleTokens;
  } catch (err: any) {
    // If the file doesn't exist or is invalid, return null
    if (err.code === 'ENOENT') {
      return null;
    }
    console.error('Error reading tokens from file:', err);
    return null;
  }
}

/**
 * Saves tokens to a local file.
 */
export async function saveTokens(tokens: GoogleTokens): Promise<void> {
  try {
    const data = JSON.stringify(tokens, null, 2);
    await fs.writeFile(TOKEN_PATH, data, 'utf-8');
    console.log(`Tokens saved to ${TOKEN_PATH}`);
  } catch (err) {
    console.error('Error saving tokens:', err);
    throw err;
  }
}
