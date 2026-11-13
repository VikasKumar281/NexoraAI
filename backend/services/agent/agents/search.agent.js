import { checkAgentLimit } from "../config/agentlimit.js";
import { getSearchTool } from "../config/tavily.js";
import { deductCredits } from "../utils/deductCredits.js";

function compactSearch(results) {
    if (!results || typeof results === "string") {
        return { answer: typeof results === "string" ? results.trim() : "", results: [], images: [] }
    }
    const list = Array.isArray(results.results) ? results.results : []
    return {
        answer: typeof results.answer === "string" ? results.answer.trim() : "",
        images: Array.isArray(results.images) ? results.images.slice(0, 4) : [],
        results: list.slice(0, 3).map((item) => ({
            title: item.title,
            url: item.url,
            content: String(item.content || "").slice(0, 280),
        })),
    }
}

export const searchAgent = async(state) =>{
    try{
       await checkAgentLimit(state.userId, "search")
       const results = await getSearchTool().invoke({
            query:state.prompt
       })
       await deductCredits(state.userId, "search")
       const compact = compactSearch(results)
       return {
        ...state,
        searchResults: compact.results,
        images: compact.images,
        aiResponse: compact.answer.length > 40 ? compact.answer : undefined
       }
    }
    catch(error){
       console.log(error)
       return {
        ...state,
        searchResults:[],
        images:[],
        aiResponse: error?.data?.message || "❌ Failed to search."
       } 
    }
} 