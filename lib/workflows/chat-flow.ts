import { WorkflowAgent, type ModelCallStreamPart } from "@ai-sdk/workflow";
import { getWritable } from "workflow";
import {
    convertToModelMessages,
    type UIMessage,
} from "ai";
import { searchProducts, getAllCategories, returnOrder, getProductDetails } from "@/lib/tools";
import { shoppingAgentInstructions } from "@/lib/instructions";

export async function chatFlow(messages: UIMessage[]) {
    "use workflow";

    const modelMessages = await convertToModelMessages(messages);

    const agent = new WorkflowAgent({
        model: "anthropic/claude-sonnet-5",
        // Created by AI (Claude Code): deviates from the guide. Uses the shared persona and style
        // instructions from lib/instructions.ts instead of the guide's plain ones.
        instructions: shoppingAgentInstructions,
        tools: { searchProducts, getAllCategories, returnOrder, getProductDetails },
    });

    await agent.stream({
        messages: modelMessages,
        writable: getWritable<ModelCallStreamPart>(),
    });
}