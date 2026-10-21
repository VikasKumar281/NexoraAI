import { getModel } from "../config/llmModels.js";

export const chatAgent = async(state) =>{
    const llm = await getModel("chat")
    const prompt = "You are NexoraAI, an intelligent AI assistant"
    const response = await llm.invoke([
        {
            "role":"system",
            "content":systemPrompt
        },
        {
            "role":"human",
            "content":state.prompt
        }
    ])

    return {
        ...state,
        aiResponse:response.content
    }
} 