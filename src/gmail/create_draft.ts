import { google } from 'googleapis';
import { getAuthenticatedClient } from '../auth/oauth.js';

export interface CreateDraftArgs {
  to: string[];
  subject: string;
  body: string;
}

/**
 * Encodes a string to base64url format.
 */
function encodeBase64Url(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Creates a draft email in the authenticated user's Gmail account.
 */
export async function createDraft(args: CreateDraftArgs) {
  const auth = await getAuthenticatedClient();
  const gmail = google.gmail({ version: 'v1', auth });

  // Construct RFC 2822 formatted message
  const headers = [
    `To: ${args.to.join(', ')}`,
    `Subject: ${args.subject}`,
    'Content-Type: text/plain; charset=utf-8'
  ];

  const messageParts = [
    headers.join('\n'),
    '', // Empty line separates headers from body
    args.body
  ];

  const rawMessage = messageParts.join('\n');
  const encodedMessage = encodeBase64Url(rawMessage);

  try {
    const res = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: encodedMessage
        }
      }
    });

    return {
      success: true,
      draftId: res.data.id
    };
  } catch (error: any) {
    console.error('Error creating draft:', error);
    throw new Error(`Failed to create draft: ${error.message}`);
  }
}
