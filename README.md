# Generic MCP Server for Google Workspace

A Model Context Protocol (MCP) server that securely exposes Google Workspace capabilities to AI Agents (like Claude Desktop, OpenAI, or Cursor) through standardized MCP tools.

This server acts as a bridge, allowing any MCP-compatible AI client to interact with Google APIs without requiring custom integrations inside the agent itself.

## Features & Tools

Currently, the server exposes the following tools:

- **`gmail_send_email`**: Sends an email (supports To, Cc, Bcc, Subject, and Text/HTML bodies).
- **`gmail_create_draft`**: Creates an email draft in the authenticated user's account.
- **`gdocs_append_content`**: Appends text to the end of a specific Google Document (requires the Document ID).

---

## Prerequisites

1. **Node.js** (v18 or newer)
2. **Google Cloud Console Project**:
   - Enable the **Gmail API** and **Google Docs API**.
   - Create an **OAuth 2.0 Client ID** (Web application).
   - Set the Authorized Redirect URI to `http://localhost` (or your domain).

---

## Setup & Local Authentication

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Copy `.env.example` to `.env` and add your Google credentials:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost
   ```

3. **Generate OAuth Tokens**
   To grant the server access to your Google account, you must complete the OAuth flow once. Run the token generation script:
   ```bash
   npm run build
   node dist/auth/generate_token.js
   ```
   *Follow the on-screen instructions. The script will save your access and refresh tokens locally in `.tokens.json`.*

---

## Running the Server

### Local Development
To run the server locally, you can use the standard build and start scripts:
```bash
npm run build
npm start
```
*Note: The server is configured to run over HTTP using Server-Sent Events (SSE) by default on `http://localhost:3000/sse`.*

### Cloud Deployment (Railway)
This server is pre-configured to be easily deployable to cloud services like Railway. 

When deploying to a remote host:
1. Ensure the `TOKEN_PATH` environment variable is set to a persistent volume (e.g., `/app/data/.tokens.json`), as the local file system in most cloud providers is ephemeral.
2. The server will automatically bind to the `PORT` environment variable provided by your cloud host.

For full instructions, see the [Deployment Plan](docs/deployment_plan.md).

---

## Connecting an AI Agent

To connect an AI Agent to this MCP Server, add the HTTP URL to your agent's MCP configuration file (e.g., in Claude Desktop).

```json
{
  "mcpServers": {
    "google-workspace": {
      "url": "http://localhost:3000/sse"
    }
  }
}
```
*(If deployed remotely, replace the URL with your remote domain, e.g., `https://my-server.up.railway.app/sse`).*
