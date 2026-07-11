import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { sendEmail } from '../gmail/send_email.js';
import { createDraft } from '../gmail/create_draft.js';
import { appendContent } from '../docs/append_content.js';

export function setupMCPServer(): Server {
  const server = new Server({
    name: 'mcp-google-workspace',
    version: '1.0.0'
  }, {
    capabilities: {
      tools: {}
    }
  });

  // Register the list of tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'gmail_send_email',
          description: 'Sends an email from the authenticated users Gmail account.',
          inputSchema: {
            type: 'object',
            properties: {
              to: { type: 'array', items: { type: 'string' }, description: 'List of recipient email addresses.' },
              cc: { type: 'array', items: { type: 'string' }, description: 'List of CC recipient email addresses.' },
              bcc: { type: 'array', items: { type: 'string' }, description: 'List of BCC recipient email addresses.' },
              subject: { type: 'string', description: 'The subject of the email.' },
              body: { type: 'string', description: 'The body content of the email.' },
              isHtml: { type: 'boolean', description: 'Set to true if the body contains HTML.' }
            },
            required: ['to', 'subject', 'body']
          }
        },
        {
          name: 'gmail_create_draft',
          description: 'Creates an email draft in the authenticated users Gmail account.',
          inputSchema: {
            type: 'object',
            properties: {
              to: { type: 'array', items: { type: 'string' }, description: 'List of recipient email addresses.' },
              subject: { type: 'string', description: 'The subject of the email.' },
              body: { type: 'string', description: 'The body content of the email.' }
            },
            required: ['to', 'subject', 'body']
          }
        },
        {
          name: 'gdocs_append_content',
          description: 'Appends text to the end of a Google Document.',
          inputSchema: {
            type: 'object',
            properties: {
              documentId: { type: 'string', description: 'The ID of the Google Document.' },
              content: { type: 'string', description: 'The text content to append.' }
            },
            required: ['documentId', 'content']
          }
        }
      ]
    };
  });

  // Register tool execution handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === 'gmail_send_email') {
        const result = await sendEmail(args as any);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      } 
      
      else if (name === 'gmail_create_draft') {
        const result = await createDraft(args as any);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      } 
      
      else if (name === 'gdocs_append_content') {
        const result = await appendContent(args as any);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      }
      
      else {
        throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: `Error executing tool ${name}: ${error.message}` }],
        isError: true
      };
    }
  });

  return server;
}
