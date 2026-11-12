import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";
import { saveMessage } from "../../chat/controllers/chat.controller.js";
import { callHandler } from "../../../shared/callHandler.js";

async function saveChatMessage(body) {
    if (process.env.CHAT_SERVICE) {
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, body);
        return;
    }
    await callHandler(saveMessage, { body });
}

export const agent = async (req,res, next) =>{
    try {
        const {prompt, conversationId, agent} = req.body
        const file = req.file
        console.log("file", file)
        const userId = req.headers["x-user-id"]


        await saveChatMessage({
            conversationId, role:"user", content:prompt
        })
        const result = await graph.invoke({
            prompt,conversationId,agent,userId,file 
        })
        console.log("result", result)
        // const response = result.aiResponse

        await addMessage(conversationId, "user", prompt)

        // await addMessage(conversationId, "assistant", response)
        await addMessage(conversationId, "assistant", result.aiResponse)

        await saveChatMessage({
            conversationId, role:"assistant", content:result?.aiResponse,images:result?.images,artifacts:result?.artifacts
        })

        return res.status(200).json({
            answer: result?.aiResponse,
            images:result?.images,
            artifacts:result?.artifacts
        })
    } 
    catch (error) {
        next(error);
    }
}