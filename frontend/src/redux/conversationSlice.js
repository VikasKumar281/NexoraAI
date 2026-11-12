import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
    name:"conversation",
    initialState:{
        conversations:[],
        selectedConversation:null
    },
    reducers:{
        setConversations:(state, action)=>{
            state.conversations=action.payload
        },
        addConversation:(state, action) =>{
            state.conversations.unshift(action.payload)
        },
        setSelectedConversation:(state, action) =>{
            state.selectedConversation = action.payload
        },
        setConvTitle:(state, action)=>{
            const {title, conversationId}= action.payload
            const conversation = state.conversations.find((conv) => conv._id == conversationId)
            if (conversation) {
                conversation.title = title
            }

            if(state.selectedConversation?._id == conversationId){
                state.selectedConversation.title = title
            }
        },
        touchConversation:(state, action)=>{
            const index = state.conversations.findIndex((conv) => conv._id == action.payload)
            if (index < 0) return
            const [conversation] = state.conversations.splice(index, 1)
            if (conversation.pinned) {
                state.conversations.unshift(conversation)
                return
            }
            const firstUnpinned = state.conversations.findIndex((conv) => !conv.pinned)
            if (firstUnpinned < 0) state.conversations.push(conversation)
            else state.conversations.splice(firstUnpinned, 0, conversation)
        },
        removeConversation:(state, action)=>{
            state.conversations = state.conversations.filter((conv) => conv._id != action.payload)
            if (state.selectedConversation?._id == action.payload) {
                state.selectedConversation = state.conversations.find((conv) => !conv.archived) || null
            }
        },
        patchConversation:(state, action)=>{
            const { id, ...fields } = action.payload
            const conversation = state.conversations.find((conv) => conv._id == id)
            if (conversation) {
                Object.assign(conversation, fields)
            }
            if (state.selectedConversation?._id == id) {
                Object.assign(state.selectedConversation, fields)
            }
        }
    }
})

export const {setConversations, addConversation, setSelectedConversation, setConvTitle, touchConversation, removeConversation, patchConversation} = conversationSlice.actions;
export default conversationSlice.reducer;
