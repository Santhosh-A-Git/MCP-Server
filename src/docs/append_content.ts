import { google } from 'googleapis';
import { getAuthenticatedClient } from '../auth/oauth.js';

export interface AppendContentArgs {
  documentId: string;
  content: string;
}

/**
 * Appends text content to a Google Document.
 */
export async function appendContent(args: AppendContentArgs) {
  const auth = await getAuthenticatedClient();
  const docs = google.docs({ version: 'v1', auth });

  try {
    // 1. Get the document to find its end index
    const docRes = await docs.documents.get({
      documentId: args.documentId
    });
    
    const document = docRes.data;
    if (!document || !document.body || !document.body.content) {
      throw new Error('Document body is empty or invalid.');
    }

    // We are deliberately setting index to 1 to prepend the newest report 
    // to the VERY TOP of the Google Doc, rather than the bottom.
    const insertIndex = 1;

    // 2. Insert the text at the top
    const updateRes = await docs.documents.batchUpdate({
      documentId: args.documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: insertIndex
              },
              text: args.content + '\n\n----------------------------------------\n\n'
            }
          }
        ]
      }
    });

    return {
      success: true,
      revisionId: updateRes.data.documentId || args.documentId
    };
  } catch (error: any) {
    console.error('Error appending content to document:', error);
    throw new Error(`Failed to append content: ${error.message}`);
  }
}
