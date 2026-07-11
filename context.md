# Project Context: Generic MCP Server for Google Workspace

## Overview
The project involves building a **generic Model Context Protocol (MCP) Server** designed to expose Google Workspace capabilities (specifically Gmail and Google Docs) to AI agents through standardized MCP tools. 

The primary goal is to empower AI agents to seamlessly and securely interact with Google services without needing to implement native Google API integrations within each individual agent. The server is strictly **agent-agnostic**, ensuring compatibility with any MCP-capable client (e.g., Claude Desktop, OpenAI Agents, Cursor).

## Core Objectives
The initial implementation focuses on exposing three primary tools for AI agents:
1. **Send Email (Gmail)**: Allowing the agent to send emails from the authenticated user's account with support for multiple recipients, CC, BCC, subjects, and text/HTML bodies.
2. **Draft Email (Gmail)**: Allowing the agent to create drafts instead of sending them immediately.
3. **Append Content (Google Docs)**: Allowing the agent to append text (with potential for rich formatting later) to an existing Google Document using its Document ID.

## Authentication Strategy
- Employs **OAuth 2.0** for secure interactions with Google APIs.
- Requires robust, secure token management including OAuth Consent Flow, Refresh Token support, automatic token refresh, and secure storage.
- Multi-user support is highly preferred.
- Required Scopes: `gmail.send`, `gmail.compose`, and `documents`.

## Architecture & Design Principles
- **Extensible & Modular**: Designed so that adding future Google Workspace services (Calendar, Drive, Sheets, etc.) does not require modifications to existing implementations.
- **Generic & Reusable**: Must not contain business-specific logic. It strictly acts as a generic bridge.
- **Stateless (where possible)**: To simplify deployments and scaling.
- **Observability**: Should include structured logging, request IDs, error logging, and tool execution metrics.
- **Reliability**: Needs to gracefully handle rate limiting, retry transient Google API failures, and sanitize errors.

## Deployment & Environments
- **Primary targets**: Docker, local Node.js runtime, and Cloud Run (preferred compatibility).
- **Optional target**: Kubernetes.

## Future Roadmap
The architecture should effortlessly support future tools such as Gmail Search, Google Drive integration, Google Sheets, Calendar, Contacts, and Tasks.

## Project Structure (Proposed)
```text
mcp-google-workspace/
    src/
        gmail/ (send_email, create_draft)
        docs/ (append_content)
        auth/ (oauth, token_store)
        server/
    README.md
    package.json
    Dockerfile
    .env.example
```
