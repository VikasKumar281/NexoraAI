import {
  Code2,
  FileText,
  Globe,
  ImageIcon,
  MessageSquare,
  Mic,
  MicOff,
  Paperclip,
  Presentation,
  Send,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import sendMessage from "../features/sendMessage.js";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  setArtifacts,
  setDraftPrompt,
  setIsLoading,
  setMessages,
} from "../redux/messageSlice.js";
import { createConversation } from "../features/createConversation.js";
import {
  addConversation,
  setConvTitle,
  setSelectedConversation,
  touchConversation,
} from "../redux/conversationSlice.js";
import { updateConversation } from "../features/updateConversation.js";
import getCurrentUser, { applySession } from "../features/getCurrentUser.js";
import { setUserdata } from "../redux/userSlice.js";

function ChatInput() {
  const [value, setValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("Auto");
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { isLoading, draftPrompt } = useSelector((state) => state.message);
  const { userData } = useSelector((state) => state.user);
  const [selectedFile, setSelectedFile] = useState(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const fileRef = useRef(null);
  const dispatch = useDispatch();

  const baseTextRef = useRef("");
  const listeningRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || "en-IN";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index++) {
        const transcript = event.results[index][0].transcript;
        if (event.results[index].isFinal) {
          baseTextRef.current = `${baseTextRef.current} ${transcript}`.replace(/\s+/g, " ").trim();
        } else {
          interimTranscript += transcript;
        }
      }

      setValue(`${baseTextRef.current} ${interimTranscript}`.replace(/\s+/g, " ").trim());
    };

    recognition.onend = () => {
      if (listeningRef.current) {
        try {
          recognition.start();
        } catch {
          listeningRef.current = false;
          setListening(false);
        }
        return;
      }
      setListening(false);
    };

    recognition.onerror = () => {
      listeningRef.current = false;
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Use Chrome.");
      return;
    }

    if (listeningRef.current) {
      listeningRef.current = false;
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    baseTextRef.current = value.trim();
    listeningRef.current = true;
    setListening(true);
    try {
      recognitionRef.current.start();
    } catch {
      listeningRef.current = false;
      setListening(false);
    }
  };

  const handleSendMessage = async (promptText) => {
    const prompt = typeof promptText === "string" ? promptText.trim() : value.trim();
    if (!prompt && !selectedFile) return;
    if (listeningRef.current) {
      listeningRef.current = false;
      recognitionRef.current?.stop();
      setListening(false);
    }

    dispatch(setIsLoading(true));
    let conversation = selectedConversation;
    if (!conversation) {
      const conv = await createConversation();
      if (!conv?._id) {
        dispatch(setIsLoading(false));
        return;
      }
      dispatch(setMessages([]));
      dispatch(setArtifacts([]));
      dispatch(addConversation(conv));
      dispatch(setSelectedConversation({ ...conv, localOnly: true }));
      conversation = conv;
    } else {
      dispatch(touchConversation(conversation._id));
    }

    if (conversation.title == "New Chat" && prompt) {
      const title = prompt.slice(0, 40);
      await updateConversation({ id: conversation?._id, title });
      dispatch(
        setConvTitle({
          conversationId: conversation?._id,
          title,
        }),
      );
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("conversationId", conversation?._id);
    formData.append("agent", selectedAgent.toLowerCase());
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    dispatch(addMessage({ role: "user", content: prompt }));
    setValue("");

    const data = await sendMessage(formData);
    dispatch(setIsLoading(false));
    setSelectedFile(null);
    dispatch(setArtifacts(data?.artifacts || []));
    if (data) {
      dispatch(
        addMessage({
          role: "assistant",
          content: data?.answer,
          images: data?.images,
        }),
      );
      const session = await getCurrentUser();
      if (session) {
        dispatch(setUserdata(applySession(userData, session)));
      }
    }
  };

    const sentDraft = useRef("");

  useEffect(() => {
    if (!draftPrompt || sentDraft.current === draftPrompt) return;
    sentDraft.current = draftPrompt;
    dispatch(setDraftPrompt(null));
    handleSendMessage(draftPrompt);
  }, [draftPrompt]);

  const agents = [
    {
      id: "auto",
      icon: Zap,
      label: "Auto",
    },
    {
      id: "chat",
      icon: MessageSquare,
      label: "Chat",
    },
    {
      id: "coding",
      icon: Code2,
      label: "Coding",
    },
    {
      id: "pdf",
      icon: FileText,
      label: "PDF",
    },
    {
      id: "ppt",
      icon: Presentation,
      label: "PPT",
    },
    {
      id: "vision",
      icon: ImageIcon,
      label: "Vision",
    },
    {
      id: "search",
      icon: Globe,
      label: "Search",
    },
  ];

  return (
    <div className="w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/6 bg-[#0d0f14]">
      <div className="flex flex-col gap-2 bg-white/3 border border-white/[0.07] rounded-2xl px-4 pt-3.5 pb-3">
        <div className="flex w-[80%] gap-2 pr-2 flex-wrap">
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label;
            const Icon = agent.icon;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent.label)}
                className={`
                  shrink-0
                  cursor-pointer
                  inline-flex
                  items-center
                  gap-1.5
                  px-3
                  py-2
                  rounded-full
                  text-xs
                  font-medium
                  border
                  transition-all
                  ${
                    isActive
                      ? "bg-linear-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
                      : "bg-white/3 text-slate-400 border-white/6 hover:bg-white/7"
                  }
                `}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-white" : "text-slate-500"}
                />
                {agent.label}
              </div>
            );
          })}
        </div>

        {selectedFile && (
          <div className="my-3">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
              {selectedFile?.type === "application/pdf" ? (
                <FileText size={16} className="text-red-400" />
              ) : (
                selectedFile?.type.startsWith("image/") && (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    className="h-10 w-10 rounded-xl object-cover mt-3"
                  />
                )
              )}

              <div>
                <p className="text-xs text-white">{selectedFile?.name}</p>
                <p className="text-[10px] text-slate-500">
                  {Math.ceil(selectedFile.size / 1024)}KB
                </p>
              </div>

              <button
                className="ml-2"
                onClick={() => {
                  setSelectedFile(null);
                  fileRef.current.value = "";
                }}
              >
                <X size={14} className="text-slate-500 hover:text-white" />
              </button>
            </div>
          </div>
        )}

        <textarea
          placeholder="Ask Anything..."
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();

              if (!isLoading && (value.trim() || selectedFile)) {
                handleSendMessage();
              }
            }
          }}
          value={value}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed scrollbar:none [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          rows={2}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <input
              type="file"
              accept=".pdf, image/*"
              hidden
              ref={fileRef}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setSelectedFile(file);
                }
              }}
            />

            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/6 transition-all duration-150 bg-transparent cursor-pointer"
              onClick={() => fileRef.current.click()}
            >
              <Paperclip size={16} />
            </button>

            <button
              onClick={toggleMic}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 cursor-pointer ${
                listening
                  ? "bg-red-500 text-white animate-pulse"
                  : "text-slate-600 hover:bg-white/5"
              }`}
            >
              {listening ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
            {listening && (
              <span className="text-[11px] text-red-300">Listening... tap the mic to stop</span>
            )}
          </div>

          <button
            disabled={(!value.trim() && !selectedFile) || isLoading}
            onClick={handleSendMessage}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer transition-all duration-150 ${
              value.trim()
                ? "bg-linear-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white"
                : "bg-white/5 text-slate-600 cursor-not-allowed"
            }`}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
