import {
  Code2,
  FileText,
  Globe,
  ImageIcon,
  MessageSquare,
  Mic,
  Paperclip,
  Presentation,
  Send,
  Square,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import sendMessage from "../features/sendMessage.js";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  setActiveConversationId,
  setArtifacts,
  setDraftPrompt,
  setIsLoading,
  setMessages,
} from "../redux/messageSlice.js";
import { createConversation } from "../features/createConversation.js";
import {
  addConversation,
  patchConversation,
  setSelectedConversation,
  touchConversation,
} from "../redux/conversationSlice.js";
import { updateConversation } from "../features/updateConversation.js";
import { makeChatTitle } from "../features/chatTitle.js";
import getCurrentUser, { applySession } from "../features/getCurrentUser.js";
import { setUserdata } from "../redux/userSlice.js";
import { store } from "../redux/store.js";

function joinSpeech(current, extra) {
  const left = String(current || "").replace(/\s+/g, " ").trim();
  const right = String(extra || "").replace(/\s+/g, " ").trim();
  if (!right) return left;
  if (!left) return right;
  const leftKey = left.toLowerCase();
  const rightKey = right.toLowerCase();
  if (leftKey === rightKey || leftKey.endsWith(rightKey)) return left;
  if (rightKey.startsWith(leftKey)) return right;
  return `${left} ${right}`;
}

function ChatInput({ centered = false }) {
  const [value, setValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("Auto");
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { isLoading, draftPrompt } = useSelector((state) => state.message);
  const { userData } = useSelector((state) => state.user);
  const [selectedFile, setSelectedFile] = useState(null);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const recognitionRef = useRef(null);
  const fileRef = useRef(null);
  const abortRef = useRef(null);
  const dispatch = useDispatch();

  const [previewUrl, setPreviewUrl] = useState("");
  const baseTextRef = useRef("");
  const listeningRef = useRef(false);
  const ignoreVoiceRef = useRef(false);
  const valueRef = useRef("");
  valueRef.current = value;

  useEffect(() => {
    if (!selectedFile?.type?.startsWith("image/")) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      if (ignoreVoiceRef.current) return;
      let finalText = "";
      let interimText = "";

      for (let index = 0; index < event.results.length; index++) {
        const transcript = event.results[index][0].transcript;
        if (event.results[index].isFinal) finalText = joinSpeech(finalText, transcript);
        else interimText = joinSpeech(interimText, transcript);
      }

      setValue(joinSpeech(baseTextRef.current, joinSpeech(finalText, interimText)));
    };

    recognition.onend = () => {
      listeningRef.current = false;
      setListening(false);
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        listeningRef.current = false;
        setListening(false);
        return;
      }
      listeningRef.current = false;
      setListening(false);
      setVoiceError(
        event.error === "not-allowed"
          ? "Microphone permission is blocked in the browser."
          : "Voice input stopped. Try again.",
      );
    };

    recognitionRef.current = recognition;
  }, []);

  const attachFile = (file) => {
    if (!file) return;
    const type = file.type || "";
    if (!type.startsWith("image/") && type !== "application/pdf") {
      setVoiceError("Paste a photo or a PDF.");
      return;
    }
    const named = file.name
      ? file
      : new File([file], type === "application/pdf" ? "pasted.pdf" : "pasted-image.png", { type });
    setSelectedFile(named);
    setVoiceError("");
  };

  const takeClipboardFile = (clipboard) => {
    const items = clipboard?.items ? [...clipboard.items] : [];
    for (const item of items) {
      if (item.kind !== "file") continue;
      const file = item.getAsFile();
      if (file) {
        attachFile(file);
        return true;
      }
    }
    const files = clipboard?.files ? [...clipboard.files] : [];
    if (files[0]) {
      attachFile(files[0]);
      return true;
    }
    return false;
  };

  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || !recognitionRef.current) {
      setVoiceError("Voice input works in Chrome or Edge.");
      return;
    }

    if (listeningRef.current) {
      listeningRef.current = false;
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    baseTextRef.current = valueRef.current.trim();
    ignoreVoiceRef.current = false;
    listeningRef.current = true;
    setListening(true);
    setVoiceError("");
    try {
      recognitionRef.current.start();
    } catch {
      listeningRef.current = false;
      setListening(false);
      setVoiceError("Allow the microphone, then tap the mic again.");
    }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
  };

  const handleSendMessage = async (promptText) => {
    const prompt = typeof promptText === "string" ? promptText.trim() : valueRef.current.trim();
    if (!prompt && !selectedFile) return;
    ignoreVoiceRef.current = true;
    listeningRef.current = false;
    try {
      recognitionRef.current?.abort();
    } catch {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* recognition already stopped */
      }
    }
    setListening(false);
    setValue("");
    valueRef.current = "";

    dispatch(setIsLoading(true));
    let conversation = selectedConversation;
    if (!conversation) {
      const conv = await createConversation();
      if (!conv?._id) {
        ignoreVoiceRef.current = false;
        valueRef.current = prompt;
        setValue(prompt);
        dispatch(setIsLoading(false));
        return;
      }
      dispatch(setActiveConversationId(conv._id));
      dispatch(setMessages([]));
      dispatch(setArtifacts([]));
      dispatch(addConversation(conv));
      dispatch(setSelectedConversation({ ...conv, localOnly: true }));
      conversation = conv;
    } else {
      dispatch(setActiveConversationId(conversation._id));
      dispatch(touchConversation(conversation._id));
    }

    const requestId = conversation._id;

    if ((conversation.title == "New Chat" || !conversation.title) && (prompt || selectedFile)) {
      const title = makeChatTitle(prompt || selectedFile.name.replace(/\.[^.]+$/, ""));
      dispatch(patchConversation({ id: conversation._id, title }));
      updateConversation({ id: conversation._id, title });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("conversationId", conversation?._id);
    formData.append("agent", selectedAgent.toLowerCase());
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    dispatch(addMessage({
      conversationId: requestId,
      role: "user",
      content: prompt,
      images: selectedFile?.type?.startsWith("image/") ? [URL.createObjectURL(selectedFile)] : [],
    }));

    const controller = new AbortController();
    abortRef.current = controller;
    const data = await sendMessage(formData, controller.signal);
    abortRef.current = null;
    setSelectedFile(null);

    const current = store.getState();
    const stillOpen = current.conversation.selectedConversation?._id == requestId
      && current.message.activeConversationId == requestId;
    if (!stillOpen) return;

    dispatch(setIsLoading(false));
    if (!data || data.discarded) return;
    dispatch(setArtifacts({
      scoped: true,
      conversationId: requestId,
      artifacts: data?.artifacts || [],
    }));
    dispatch(
      addMessage({
        conversationId: requestId,
        role: "assistant",
        content: data?.answer,
        images: data?.images,
      }),
    );
    const session = await getCurrentUser();
    if (session && store.getState().conversation.selectedConversation?._id == requestId) {
      dispatch(setUserdata(applySession(userData, session)));
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
    <div className={centered ? "w-full" : "w-full px-3 md:px-6 pb-5 pt-2 bg-[#0d0f14]"}>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          const file = event.dataTransfer.files?.[0];
          if (file) attachFile(file);
        }}
        className={`mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-[28px] border bg-[#17181d] px-4 pt-3 pb-2.5 ${
          dragOver ? "border-indigo-400/70" : "border-white/10"
        }`}
      >
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
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
          <div className="flex">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-2 py-2">
              {selectedFile.type === "application/pdf" ? (
                <FileText size={18} className="text-red-400" />
              ) : (
                previewUrl && (
                  <img
                    src={previewUrl}
                    alt=""
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                )
              )}

              <div className="min-w-0 pr-1">
                <p className="max-w-[180px] truncate text-xs text-white">{selectedFile.name}</p>
                <p className="text-[10px] text-slate-500">
                  {Math.ceil(selectedFile.size / 1024)}KB
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedFile(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                <X size={14} className="text-slate-500 hover:text-white" />
              </button>
            </div>
          </div>
        )}

        <textarea
          placeholder="Ask anything"
          onChange={(e) => setValue(e.target.value)}
          onPaste={(event) => {
            if (takeClipboardFile(event.clipboardData)) event.preventDefault();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();

              if (!isLoading && (value.trim() || selectedFile)) {
                handleSendMessage();
              }
            }
          }}
          value={value}
          className="w-full bg-transparent outline-none resize-none text-[15px] text-slate-100 placeholder:text-slate-500 leading-relaxed scrollbar:none [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          rows={centered ? 2 : 2}
        />

        {voiceError && (
          <p className="text-[12px] text-amber-300/90">{voiceError}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <input
              type="file"
              accept=".pdf, image/*"
              hidden
              ref={fileRef}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) attachFile(file);
              }}
            />

            <button
              title="Attach a photo or PDF"
              className="flex items-center justify-center w-9 h-9 rounded-full text-slate-300 hover:text-white hover:bg-white/8 transition-all duration-150 bg-transparent cursor-pointer"
              onClick={() => fileRef.current.click()}
            >
              <Paperclip size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              title={listening ? "Stop voice input" : "Voice input"}
              onClick={toggleMic}
              className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150 cursor-pointer ${
                listening
                  ? "bg-red-500 text-white"
                  : "text-slate-100 hover:bg-white/8"
              }`}
            >
              <Mic size={18} />
            </button>

            <button
              disabled={!isLoading && !value.trim() && !selectedFile}
              onClick={() => (isLoading ? stopGeneration() : handleSendMessage())}
              className={`flex items-center justify-center w-9 h-9 rounded-full border-none cursor-pointer transition-all duration-150 ${
                isLoading || value.trim() || selectedFile
                  ? "bg-white text-black hover:bg-slate-200"
                  : "bg-white/10 text-slate-500 cursor-not-allowed"
              }`}
            >
              {isLoading ? <Square size={13} fill="currentColor" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      </div>
      {centered && (
        <p className="mx-auto mt-3 max-w-3xl text-center text-[12px] text-slate-500">
          Enter to send. Shift+Enter for a new line. Ctrl+V pastes a photo or PDF.
        </p>
      )}
    </div>
  );
}

export default ChatInput;
