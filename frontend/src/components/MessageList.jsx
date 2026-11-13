import { useSelector } from "react-redux";
import MessageBubble from "./MessageBubble.jsx";
import LoadingAnimation from "./LoadingAnimation.jsx";
import { useEffect, useRef } from "react";

function MessageList (){
  const {messages, isLoading} = useSelector(state => state.message)
  const bottomRef = useRef(null)

  useEffect(()=>{
    requestAnimationFrame(()=>{
      bottomRef?.current.scrollIntoView({
        behavior:"smooth",
        block:"end"
      })
    })
  },[messages?.length, isLoading]) 

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 md:px-6 scrollbar:none [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-end gap-6 py-6">
        {messages?.map((msg, i)=>(
          <div key={msg._id || `${msg.role}-${i}`}>
            <MessageBubble role ={msg?.role} content = {msg?.content} images={msg?.images || []}/>
          </div>
        ))}

        {isLoading &&  <LoadingAnimation/> }
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export default MessageList;