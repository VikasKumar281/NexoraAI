import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels.js";
import { getMemory } from "../config/memory.js";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentlimit.js";
import { modelText } from "../utils/readModelJson.js";

export const chatAgent = async(state) =>{
    
    try {

        await checkAgentLimit(state.userId, "chat")

        const llm = await getModel("chat")

        const history = await getMemory(state.conversationId)

        const hasSearch = Array.isArray(state.searchResults) && state.searchResults.length > 0
        const recentHistory = hasSearch ? history.slice(-2) : history
        const searchContext = hasSearch ? `
            Answer from these search snippets only. Start with the fact. Keep it short.
            ${JSON.stringify(state.searchResults)}
        ` : ""

        const systemPrompt = `
            You are NexoraAI. Reply the way ChatGPT does.

            ${searchContext}
            ${hasSearch ? "Use the search snippets for facts. Do not mention search, tools, or sources unless the user asks." : ""}

            Voice:
            - Answer in the same language the user used.
            - Start with the answer itself. No greeting, no "Certainly", no "Great question", no "As an AI".
            - Sound like a person explaining something clearly, not like a textbook or a report.
            - For a simple question, write one or two short paragraphs.
            - Add a little more only when the question needs it. Do not pad.

            Shape:
            - Prefer normal sentences. Use a blank line between paragraphs.
            - Use a short bullet list only when you are listing several items.
            - Use a numbered list only for steps the user should follow in order.
            - Do not open with a heading. Do not add a title.
            - Use a heading only inside a long answer that truly has separate parts, and keep it small.
            - Put code in a fenced block with the language name. Explain it in a sentence before the block.
            - Bold only the few words that matter, not whole sentences.
            - Do not repeat the question back.
        `    

        const messages = [
            new SystemMessage(systemPrompt)
        ]
        
        recentHistory.forEach(msg => {
            if(msg.role == "user"){
                messages.push(new HumanMessage(msg.content))
            }
            if(msg.role == "assistant"){
                messages.push(new AIMessage(msg.content))
            }
        });

        messages.push(new HumanMessage(state.prompt))
        // console.log(messages)
        
        const response = await llm.invoke(messages)
        await deductCredits(state.userId, "chat")

        return {
            ...state,
            aiResponse: modelText(response.content).trim() || "I could not generate a reply. Please try again."
        }
    } 
    catch (error) {
        console.log(error)

        return {
            ...state,
            aiResponse: error?.data?.message || "❌ Failed to generate chat."
        }
    }
} 