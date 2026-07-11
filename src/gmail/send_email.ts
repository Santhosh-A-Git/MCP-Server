import { google } from 'googleapis';
import { getAuthenticatedClient } from '../auth/oauth.js';

export interface SendEmailArgs {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
}

/**
 * Encodes a string to base64url format as required by the Gmail API.
 */
function encodeBase64Url(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends an email using the authenticated user's Gmail account.
 */
export async function sendEmail(args: SendEmailArgs) {
  const auth = await getAuthenticatedClient();
  const gmail = google.gmail({ version: 'v1', auth });

  // Construct RFC 2822 formatted message
  const headers = [
    `To: ${args.to.join(', ')}`,
    `Subject: ${args.subject}`,
  ];

  if (args.cc && args.cc.length > 0) {
    headers.push(`Cc: ${args.cc.join(', ')}`);
  }
  
  if (args.bcc && args.bcc.length > 0) {
    headers.push(`Bcc: ${args.bcc.join(', ')}`);
  }

  // Set content type
  if (args.isHtml) {
    headers.push('Content-Type: text/html; charset=utf-8');
  } else {
    headers.push('Content-Type: text/plain; charset=utf-8');
  }

  const messageParts = [
    headers.join('\n'),
    '', // Empty line separates headers from body
    args.body
  ];

  const rawMessage = messageParts.join('\n');
  const encodedMessage = encodeBase64Url(rawMessage);

  try {
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    return {
      success: true,
      messageId: res.data.id,
      threadId: res.data.threadId
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
