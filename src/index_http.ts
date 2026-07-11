import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { setupMCPServer } from './server/mcp.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Need to parse JSON bodies for the /messages endpoint
app.use(express.json());

let transport: SSEServerTransport | null = null;
const server = setupMCPServer();

app.get('/sse', async (req, res) => {
  transport = new SSEServerTransport('/messages', res);
  await server.connect(transport);
  
  // Clean up when the client disconnects
  res.on('close', () => {
    transport = null;
  });
});

app.post('/messages', async (req, res) => {
  if (!transport) {
    return res.status(400).send('No active SSE connection');
  }
  await transport.handlePostMessage(req, res);
});

app.listen(PORT, () => {
  console.log(`MCP Google Workspace Server running on HTTP/SSE at http://localhost:${PORT}`);
  console.log(`SSE Endpoint: http://localhost:${PORT}/sse`);
});
