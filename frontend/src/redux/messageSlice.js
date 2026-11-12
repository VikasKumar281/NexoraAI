import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name:"message",
    initialState:{
        messages:[],
        artifacts:[],
        isLoading:false,
        draftPrompt:null,
        activeConversationId:null
    },
    reducers:{
        setActiveConversationId:(state, action)=>{
            state.activeConversationId = action.payload || null
        },
        setMessages:(state, action)=>{
            state.messages=action.payload
        },
        addMessage:(state, action)=>{
            const { conversationId, ...message } = action.payload
            if (conversationId != state.activeConversationId) return
            state.messages.push(message)
        },  
        setArtifacts:(state, action)=>{
            if (action.payload?.scoped) {
                if (action.payload.conversationId != state.activeConversationId) return
                state.artifacts = action.payload.artifacts || []
                return
            }
            state.artifacts = action.payload
        },
        setIsLoading:(state, action)=>{
            state.isLoading = action.payload
        },
        setDraftPrompt:(state, action)=>{
            state.draftPrompt = action.payload
        },          
    }
})

export const {setMessages, addMessage, setArtifacts, setIsLoading, setDraftPrompt, setActiveConversationId} = messageSlice.actions;
export default messageSlice.reducer;
