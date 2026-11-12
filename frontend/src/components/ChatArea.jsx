import { useEffect } from "react";
import ChatInput from "./ChatInput.jsx";
import MessageList from "./MessageList.jsx";
import Nav from "./Nav.jsx";
import { useDispatch, useSelector } from "react-redux";
import getMessages from "../features/getMessages.js";
import { setArtifacts, setActiveConversationId, setDraftPrompt, setIsLoading, setMessages } from "../redux/messageSlice.js";
import { store } from "../redux/store.js";

const starters = [
  "Explain how Redis works",
  "Draft a professional email",
  "Plan a React dashboard",
];

function ChatArea(){

  const {selectedConversation } = useSelector(state => state.conversation)
  const { messages } = useSelector(state => state.message)
  const { userData } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const firstName = userData?.name?.split(" ")[0]
  useEffect(()=>{
    let cancelled = false
    const requestedId = selectedConversation?._id

    const getMesg = async () => {
      dispatch(setActiveConversationId(requestedId || null))

      if (!requestedId) {
        dispatch(setMessages([]))
        dispatch(setArtifacts([]))
        dispatch(setIsLoading(false))
        return
      }

      if (selectedConversation.localOnly) {
        return
      }

      dispatch(setIsLoading(false))
      dispatch(setMessages([]))
      dispatch(setArtifacts([]))

      const data = await getMessages(requestedId)
      if (cancelled) return
      if (store.getState().conversation.selectedConversation?._id != requestedId) return

      const saved = Array.isArray(data) ? data : []
      const live = store.getState().message
      const pending = live.isLoading
        ? live.messages.filter((msg) => !msg._id && !saved.some((item) => item.role == msg.role && item.content == msg.content))
        : []
      dispatch(setMessages([...saved, ...pending]))

      const latestArtifactMessage = [...saved].reverse().find(msg => msg.artifacts && msg.artifacts.length > 0)
      dispatch(setArtifacts(latestArtifactMessage?.artifacts || []))
    }

    getMesg()
    return () => {
      cancelled = true
    }
  },[selectedConversation?._id, selectedConversation?.localOnly])
  
  
  const isFresh = !selectedConversation && messages.length === 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0d0f14]">
        {!isFresh && <Nav/>}
        <div className={`flex-1 flex flex-col min-h-0 ${isFresh ? "items-center justify-center px-4" : ""}`}>
          {isFresh ? (
            <div className="mb-7 w-full max-w-3xl text-center">
              <h1 className="text-[32px] md:text-[40px] font-medium tracking-tight text-slate-100">
                {firstName ? `How can I help you, ${firstName}?` : "How can I help you?"}
              </h1>
              <p className="mt-3 text-[15px] text-slate-500">
                Ask a question, paste a photo, or dictate with the microphone.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {starters.map((item) => (
                  <button
                    key={item}
                    onClick={() => dispatch(setDraftPrompt(item))}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[13px] text-slate-300 transition-colors hover:bg-white/[0.07] cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <MessageList />
          )}
          <div className="w-full">
            <ChatInput centered={isFresh} />
          </div>
        </div>
    </div>
  )
}

export default ChatArea;