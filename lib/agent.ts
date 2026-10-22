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
import { searchProducts, getAllCategories, getProductDetails } from "@/lib/tools";

// getProductDetails registration and its instruction line were added by AI (Claude Code).
export const shoppingAgent = new ToolLoopAgent({
    model: "anthropic/claude-sonnet-5",
    instructions: `You are a helpful assistant for the Vercel swag store. When the user asks about products, availability, or recommendations, use the searchProducts tool to look up real catalog data before answering.
  When asked about a type or category of product use the getAllCategories tool for getting valid categories before using searchProducts
  When the user asks about one specific product (its details, stock, or availability), use getProductDetails with that product's id or slug. Use searchProducts for browsing.`,
    tools: { searchProducts, getAllCategories, getProductDetails },
});
