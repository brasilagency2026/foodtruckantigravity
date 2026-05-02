# Mercado Pago MCP Integration Skill

This skill provides a comprehensive guide and templates for integrating the official Mercado Pago MCP (Model Context Protocol) server into your AI-assisted development workflow.

## Overview

The Mercado Pago MCP server allows AI agents (like Antigravity) to interact directly with the Mercado Pago API to diagnose webhooks, simulate payments, and manage test users without leaving the IDE.

## 1. Connection Setup

To enable this skill in your environment, you must add the server to your `mcp_config.json` file.

### Configuration Template

```json
{
  "mcpServers": {
    "mercadopago": {
      "serverURL": "https://mcp.mercadopago.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_ACCESS_TOKEN"
      }
    }
  }
}
```

> [!IMPORTANT]
> - Use a **Production Token** (`APP_USR-...`) in the headers for the best results, even for sandbox testing.
> - Ensure the key is `serverURL` (case-sensitive) and NOT `url`.

## 2. Core Tools Guide

Once connected, the following tools become available to the AI:

| Tool | Purpose | Use Case |
|---|---|---|
| `notifications_history` | View status of sent webhooks | Debugging why a payment didn't activate. |
| `simulate_webhook` | Manually trigger a notification | Testing your backend logic without a real payment. |
| `save_webhook` | Configure endpoint URLs | Pointing Mercado Pago to your Vercel URL. |
| `create_test_user` | Scaffolding test accounts | Getting clean buyer/seller accounts. |

## 3. Best Practices for Webhooks

To ensure your integration works on the first try, follow these rules:

### No Domain Redirects
Mercado Pago POST requests are often dropped during `www` to non-`www` (or vice-versa) redirects. 
**Rule:** Always use the final canonical URL in `notification_url`.

### Public Routes
If using Clerk or any Auth middleware:
**Rule:** Add your webhook path (e.g., `/api/webhooks(.*)`) to the `publicRoutes` or the exception list in `middleware.ts`.

### Fast Responses
Mercado Pago expects a `200 OK` within seconds.
**Rule:** Log the event and respond immediately. If you have heavy processing, move it to a background task or use `waitUntil`.

## 4. Troubleshooting Checklist

If a payment is not reflecting in your database:
1. [ ] Check `notifications_history` to see if a `502` or `404` was returned.
2. [ ] Verify that the `external_reference` matches your database ID exactly.
3. [ ] Perform a "Hard Refresh" (Shift+F5) on your dashboard to clear frontend cache.
4. [ ] Check logs for "Unauthorized" errors in the MCP configuration.

---
*Created by Antigravity for Food Pronto Projects.*
