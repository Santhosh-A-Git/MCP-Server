import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { setupMCPServer } from './server/mcp.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Maintain a map of active SSE transports by session ID
const transports = new Map<string, SSEServerTransport>();

// Note: We remove app.use(express.json()) because it consumes the request stream,
// which causes the MCP SDK's handlePostMessage to hang (ReadTimeout).
// The SDK is perfectly capable of parsing the incoming message stream itself.

const server = setupMCPServer();

app.get('/sse', async (req, res) => {
  const transport = new SSEServerTransport('/messages', res);
  // Store the transport using the auto-generated sessionId
  transports.set(transport.sessionId, transport);
  await server.connect(transport);
  
  // Clean up when the client disconnects
  res.on('close', () => {
    transports.delete(transport.sessionId);
  });
});

app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports.get(sessionId);
  
  if (!transport) {
    return res.status(400).send('No active SSE connection for this session');
  }
  
  await transport.handlePostMessage(req, res);
});

app.listen(PORT, () => {
  console.log(`MCP Google Workspace Server running on HTTP/SSE at http://localhost:${PORT}`);
  console.log(`SSE Endpoint: http://localhost:${PORT}/sse`);
});
