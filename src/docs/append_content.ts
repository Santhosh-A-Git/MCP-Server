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

    // The end of the document is the end index of the last element in the body, minus 1.
    const lastElement = document.body.content[document.body.content.length - 1];
    const endIndex = (lastElement.endIndex || 2) - 1;

    // 2. Insert the text at the end index
    const updateRes = await docs.documents.batchUpdate({
      documentId: args.documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: endIndex
              },
              text: args.content + '\n'
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
