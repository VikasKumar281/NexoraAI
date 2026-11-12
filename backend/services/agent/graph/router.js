import { getModel } from "../config/llmModels.js";

function quickAgent(prompt) {
    const text = String(prompt || "").trim()
    const lower = text.toLowerCase()
    if (!lower) return null

    if (/\b(powerpoint|presentation|slides?|ppt)\b/.test(lower)) return "ppt"
    if (/\b(generate|create|make|write)\b/.test(lower) && /\bpdf\b/.test(lower)) return "pdf"
    if (/\b(image|picture|photo|logo|illustration)\b/.test(lower) && /\b(generate|create|draw|make|design)\b/.test(lower)) return "vision"
    if (/\b(latest|news|today|current events|right now|who won|price of|search the web)\b/.test(lower)) return "search"
    if (/\b(code|debug|javascript|typescript|python|react|function|component|api|bug|algorithm)\b/.test(lower)) return "coding"
    if (/^(hi|hello|hey|hii|yo|namaste|thanks|thank you|ok|okay|good morning|good evening|good night|kaise ho|kya haal hai)[!.?\s]*$/i.test(text)) {
        return "chat"
    }
    return null
}

export const router = async(state) =>{
    
    if(state.agent && state.agent !== "auto"){
        return {
            ...state,
            agent:state.agent
        }
    }

    if(state.file){
        if(state.file?.mimetype === "application/pdf"){
            return {
                ...state,
                agent:"pdfRag"
            }
        }
        

        if(state.file?.mimetype?.startsWith("image/")){
            return {
                ...state,
                agent:"imageAnalyzer"
            }
        }
    }

    const quick = quickAgent(state.prompt)
    if (quick) {
        return {
            ...state,
            agent: quick
        }
    }

    const llm = await getModel("router")
    const prompt = `You are an agent router.

Available agents:

- chat
- search
- coding
- pdf
- ppt
- vision

Rules:

chat:
General conversation,
explanations,
learning,
questions.

search:
Current events,
latest information,
news,
recent developments,
internet lookup.

coding:
Generate code,
debug code,
build projects,
architecture,
API design.

pdf:
Questions about generate PDFs
or document context.

ppt:
Questions about generate ppts
or ppt context.

vision:
Generate image,
create image


Return ONLY one word:

chat
search
coding
pdf
ppt
vision

User Query:
 ${state.prompt}
`

const response = await llm.invoke(prompt)
// console.log(response);

return {
    ...state,
    agent:response.content.trim().toLowerCase()
}

}