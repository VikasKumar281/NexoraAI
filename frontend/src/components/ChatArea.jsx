import { useEffect } from "react";
import ChatInput from "./ChatInput.jsx";
import MessageList from "./MessageList.jsx";
import Nav from "./Nav.jsx";
import { useDispatch, useSelector } from "react-redux";
import getMessages from "../features/getMessages.js";
import { setArtifacts, setMessages } from "../redux/messageSlice.js";

function ChatArea(){

  const {selectedConversation } = useSelector(state => state.conversation)
  const dispatch = useDispatch()
  useEffect(()=>{
    const getMesg = async () => {
      if (!selectedConversation) {
        dispatch(setMessages([]))
        dispatch(setArtifacts([]))
        return
      }

      if (selectedConversation.localOnly) {
        return
      }

      const data = await getMessages(selectedConversation?._id)
      dispatch(setMessages(data || []))

      const latestArtifactMessage = [...(data || [])].reverse().find(msg => msg.artifacts && msg.artifacts.length > 0)
      dispatch(setArtifacts(latestArtifactMessage?.artifacts || []))
    }

    getMesg() 
  },[selectedConversation?._id, selectedConversation?.localOnly])
  
  
  return (
    <div className="flex-1 flex flex-col min-w-0">
        <Nav/>
        <MessageList/>
        <ChatInput/>
    </div>
  )
}

export default ChatArea;