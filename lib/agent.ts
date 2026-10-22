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

import {
    ToolLoopAgent,
    type InferAgentUIMessage,
    type UIToolInvocation,
} from "ai";
import { searchProducts, getAllCategories, returnOrder, getProductDetails } from "@/lib/tools";
import { shoppingAgentInstructions } from "@/lib/instructions";

export const shoppingAgent = new ToolLoopAgent({
    model: "anthropic/claude-sonnet-5",
    instructions: shoppingAgentInstructions,
    tools: { searchProducts, getAllCategories, getProductDetails, returnOrder },
});

export type ShoppingAgentUIMessage = InferAgentUIMessage<typeof shoppingAgent>;
export type SearchProductsToolInvocation = UIToolInvocation<typeof searchProducts>;
export type ProductDetailsToolInvocation = UIToolInvocation<typeof getProductDetails>;
