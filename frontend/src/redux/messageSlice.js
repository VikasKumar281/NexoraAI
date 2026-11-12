import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name:"message",
    initialState:{
        messages:[],
        artifacts:[],
        isLoading:false,
        draftPrompt:null
    },
    reducers:{
        setMessages:(state, action)=>{
            state.messages=action.payload
        },
        addMessage:(state, action)=>{
            state.messages.push(action.payload)
        },  
        setArtifacts:(state, action)=>{
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

export const {setMessages, addMessage, setArtifacts, setIsLoading, setDraftPrompt} = messageSlice.actions;
export default messageSlice.reducer;
