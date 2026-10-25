import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";
import redis from "../../../shared/redis/redis.js";

export const agent = async (req,res) =>{
    try {
        const {prompt, conversationId, agent} = req.body

        await axios.post(`${process.env.CHAT_SERVICE}/save-message`,{
            conversationId, role:"user", content:prompt
        })
        const result = await graph.invoke({
            prompt,conversationId,agent  
        })
        console.log("result", result)
        // const response = result.aiResponse

        await addMessage(conversationId, "user", prompt)

        // await addMessage(conversationId, "assistant", response)
        await addMessage(conversationId, "assistant", result.aiResponse)

        await axios.post(`${process.env.CHAT_SERVICE}/save-message`,{
            conversationId, role:"assistant", content:result.aiResponse,images:result.images
        })

        return res.status(200).json({
            answer: result.aiResponse,
            images:result.images
        })
    } 
    catch (error) {
        return res.status(500).json({message: `agent error ${error}`})
    }
}