import axios from "axios";
import { getMessages as getMessagesHandler } from "../../chat/controllers/chat.controller.js";
import { callHandler } from "../../../shared/callHandler.js";

export const getMessages = async (conversationId)=>{
   try {
    if (process.env.CHAT_SERVICE) {
      const { data } = await axios.get(`${process.env.CHAT_SERVICE}/get-messages/${conversationId}`)
      return data
    }
    return await callHandler(getMessagesHandler, {
      params: { conversationId }
    })
   } 
   catch (error) {
    console.log(error)
    return null
   } 
}