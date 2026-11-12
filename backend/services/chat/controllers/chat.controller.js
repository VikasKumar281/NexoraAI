import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";


export const createConversation = async(req, res) =>{
    try {
        const userId=req.headers["x-user-id"]
        console.log("userId", userId)
        const conversation = await Conversation.create({
            userId:userId
        })
        
        return res.status(200).json(conversation)
    } 
    catch (error) {
        return res.status(500).json({message: `create conversation error ${error}`})
    }
}



export const getConversations = async(req, res) =>{
    try {
        const userId=req.headers["x-user-id"]
        console.log("userId", userId)
        const conversations = await Conversation.find({
            userId:userId
        }).sort({pinned:-1, pinnedAt:-1, updatedAt:-1})
        
        return res.status(200).json(conversations)
    } 
    catch (error) {
        return res.status(500).json({message: `get conversations error ${error}`})
    }
}




export const updateConversation = async(req, res) =>{
    try {
        const userId = req.headers["x-user-id"]
        const {id, title, pinned, archived} = req.body
        const update = {}

        if (typeof title === "string" && title.trim()) {
            update.title = title.trim().slice(0, 80)
        }
        if (typeof pinned === "boolean") {
            update.pinned = pinned
            update.pinnedAt = pinned ? new Date() : null
        }
        if (typeof archived === "boolean") {
            update.archived = archived
            if (archived) {
                update.pinned = false
                update.pinnedAt = null
            }
        }

        const conversation = await Conversation.findOneAndUpdate(
            { _id: id, userId },
            update,
            { new: true }
        )

        if (!conversation) {
            return res.status(404).json({message:"Conversation not found"})
        }
        
        return res.status(200).json(conversation)
    } 
    catch (error) {
        return res.status(500).json({message: `Update conversation error ${error}`})
    }
}




export const saveMessage = async (req, res) =>{
    try {
        const userId = req.headers["x-user-id"]
        const {conversationId, role, content, images, artifacts}=req.body
        const conversation = await Conversation.findOne({
            _id: conversationId,
            ...(userId ? { userId } : {})
        })
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" })
        }

        const message = await Message.create({
            conversationId,
            content,
            role,
            images,
            artifacts
        })

        if (conversationId) {
            await Conversation.findByIdAndUpdate(conversationId, {
                $currentDate: { updatedAt: true }
            })
        }

        return res.status(200).json(message)
    } 
    catch (error) {
        return res.status(500).json({message: `save message error ${error}`})
    }
}




export const deleteConversation = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"]
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            userId
        })

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" })
        }

        await Message.deleteMany({ conversationId: conversation._id })
        await conversation.deleteOne()

        return res.status(200).json({ success: true })
    }
    catch (error) {
        return res.status(500).json({ message: `delete conversation error ${error}` })
    }
}



export const getMessages = async (req, res) =>{
    try {
        const userId = req.headers["x-user-id"]
        const conversationId = req.params.conversationId
        if (userId) {
            const conversation = await Conversation.findOne({
                _id: conversationId,
                userId
            })
            if (!conversation) {
                return res.status(200).json([])
            }
        }

        const messages = await Message.find({
            conversationId
        })

        return res.status(200).json(messages)
    } 
    catch (error) {
        return res.status(500).json({message: `get messages error ${error}`})
    }
}