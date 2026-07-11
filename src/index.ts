import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { setupMCPServer } from './server/mcp.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.error('Starting MCP Google Workspace Server...');

  // Set up the server
  const server = setupMCPServer();

  // Create Stdio Transport
  const transport = new StdioServerTransport();

  // Connect the server to the transport
  await server.connect(transport);
  
  console.error('MCP Google Workspace Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});
