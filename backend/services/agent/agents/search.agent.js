import { checkAgentLimit } from "../config/agentlimit.js";
import { getSearchTool } from "../config/tavily.js";
import { deductCredits } from "../utils/deductCredits.js";

export const searchAgent = async(state) =>{
    try{
       await checkAgentLimit(state.userId, "search")
       const results = await getSearchTool().invoke({
            query:state.prompt
       })
       await deductCredits(state.userId, "search")
      //  console.log(results)
       return {
        ...state,
        searchResults:results,
        images:results.images
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