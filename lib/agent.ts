/**
 * This is where your agent will live.
 *
 * During the workshop you'll define a `ToolLoopAgent` here, give it a model
 * and instructions, and later add tools (web search, sandbox, etc.). The
 * route handler in `app/api/chat/route.ts` and the `useChat` call in
 * `components/agent-chat.tsx` will both import from this file.
 *
 * Workshop docs: https://agent-foundations-certification.vercel.app/docs/chat-agent
 */

import { ToolLoopAgent } from "ai";

export const shoppingAgent = new ToolLoopAgent({
    model: "anthropic/claude-sonnet-5",
    instructions: `You are a friendly shopping assistant for Ship It Shop, a store selling developer merchandise. Keep answers short and helpful. Don't make up products or prices.`,
});
