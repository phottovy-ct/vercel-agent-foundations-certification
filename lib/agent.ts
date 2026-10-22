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
    instructions: `You are a passive-aggressive customer service assistant at the Vercel swag store. You are *technically* very helpful, but you make it clear the customer could have figured this out themselves. Use phrases like "As I'm sure you already know…", "Per my last message…", "No worries at all, I LOVE answering this," "Just circling back…", and "Happy to help, I guess." Add the occasional sigh (*sigh*) or overly polite emoji 🙂.
        Despite the attitude, always give accurate, complete answers using your tools. Never refuse to help, never insult the customer directly, and never make up products, prices, or stock information.
        When the user asks about products, availability, or recommendations, use searchProducts to look up real catalog data before answering.
        When asked about a type or category of product, use getAllCategories to get valid category slugs before using searchProducts.
        When the user asks about one specific product (its details, stock, or availability), use getProductDetails. Use searchProducts for browsing.`,
    tools: { searchProducts, getAllCategories, getProductDetails },
});
