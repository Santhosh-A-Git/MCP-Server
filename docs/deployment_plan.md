# Railway Deployment Plan: Google Workspace MCP Server

Deploying an MCP server to a cloud provider like Railway requires a few architectural adjustments. Currently, the server is designed to run locally using `stdio` (standard input/output) transport, which is how local clients (like Claude Desktop) communicate with it. 

To deploy it remotely to Railway, the server must be converted to communicate over HTTP using **Server-Sent Events (SSE)**.

Here is the step-by-step plan to prepare and deploy this MCP server to Railway.

---

## 1. Codebase Adjustments for Cloud Deployment

### A. Implement HTTP/SSE Transport
You cannot use `stdio` over the internet. You must create a new entry point (e.g., `src/index_http.ts`) that uses an HTTP server (like Express) and the `@modelcontextprotocol/sdk/server/sse.js` transport.

**Required Changes:**
- Install Express: `npm install express`
- Set up an Express server listening on `process.env.PORT || 3000`.
- Create a `/messages` POST endpoint and an `/sse` GET endpoint to handle the MCP JSON-RPC protocol over HTTP.

### B. Persistent Token Storage
Currently, the OAuth tokens are saved to a local `.tokens.json` file. Railway's default file system is **ephemeral**, meaning every time your app deploys or restarts, the `.tokens.json` file will be erased, forcing you to re-authenticate.

**Solutions:**
1. **(Recommended)** Use a Railway Postgres or Redis database to store the tokens instead of the file system. You would update `src/auth/token_store.ts` to read/write to the database.
2. **(Alternative)** Mount a **Railway Volume** to your service and update the `TOKEN_PATH` in `src/auth/token_store.ts` to point to the volume mount path (e.g., `/data/.tokens.json`).

---

## 2. Preparing the Repository

### A. Update `package.json`
Ensure you have a clean start script for Railway.
```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index_http.js"
}
```

### B. Commit to GitHub
Railway deploys directly from GitHub. You must commit your code to a GitHub repository.
*Make sure your `.gitignore` is intact so you don't commit your local `.env` or `.tokens.json` files!*

---

## 3. Railway Configuration

### Step 1: Create the Project
1. Log into [Railway.app](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your MCP Server repository.

### Step 2: Configure Environment Variables
Go to the **Variables** tab in your Railway service and add:
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
- `GOOGLE_REDIRECT_URI`: Update this to your production domain if needed, though for the initial token generation, you can generate it locally and paste the resulting refresh token into Railway, or use a Railway domain.

### Step 3: Configure Networking (Port)
Railway automatically detects the `PORT` environment variable. Ensure your Express server uses `process.env.PORT`. Railway will expose your app to the public internet automatically.

### Step 4: Persistent Volume (If using File-based Token Storage)
1. Go to the **Volumes** tab in Railway and create a new volume.
2. Mount the volume to a path like `/app/data`.
3. Update your code's `TOKEN_PATH` to `/app/data/.tokens.json`.

---

## 4. Connecting Your AI Client to the Remote Server

Once deployed, Railway will provide you with a public URL (e.g., `https://mcp-server-production.up.railway.app`).

To connect a remote AI agent to this server, the client must support SSE connections. Instead of specifying a local `command` like `node`, the client configuration will point to the remote URL:

```json
{
  "mcpServers": {
    "google-workspace-remote": {
      "url": "https://mcp-server-production.up.railway.app/sse"
    }
  }
}
```

---

## Next Actions
If you would like to proceed with this plan, let me know! I can:
1. Write the `src/index_http.ts` file using Express and SSE.
2. Update the token store to read from environment variables or prepare it for a Railway Volume.
