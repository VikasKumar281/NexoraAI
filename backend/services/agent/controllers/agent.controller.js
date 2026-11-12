import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";
import { saveMessage } from "../../chat/controllers/chat.controller.js";
import { callHandler } from "../../../shared/callHandler.js";

async function saveChatMessage(body, userId) {
    const headers = { "x-user-id": userId }
    if (process.env.CHAT_SERVICE) {
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, body, { headers });
        return;
    }
    await callHandler(saveMessage, { body, headers });
}

export const agent = async (req,res, next) =>{
    try {
        const {prompt, conversationId, agent} = req.body
        const file = req.file
        console.log("file", file)
        const userId = req.headers["x-user-id"]


        const [, result] = await Promise.all([
            saveChatMessage({
                conversationId, role:"user", content:prompt
            }, userId),
            graph.invoke({
                prompt,conversationId,agent,userId,file
            })
        ])
        console.log("result", result)
        // const response = result.aiResponse

        await addMessage(conversationId, "user", prompt)

        // await addMessage(conversationId, "assistant", response)
        await addMessage(conversationId, "assistant", result.aiResponse)

        await saveChatMessage({
            conversationId, role:"assistant", content:result?.aiResponse,images:result?.images,artifacts:result?.artifacts
        }, userId)

        return res.status(200).json({
            answer: result?.aiResponse,
            images:result?.images,
            artifacts:result?.artifacts
        })
    } 
    catch (error) {
        if (error.status === 404) {
            return res.status(200).json({ discarded: true })
        }
        next(error);
    }
}