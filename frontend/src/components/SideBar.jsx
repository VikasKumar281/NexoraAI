import {
  Archive,
  Coins,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  PanelLeftIcon,
  PanelRight,
  Pencil,
  PenSquare,
  Pin,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getConversations } from "../features/getConversations.js";
import { useDispatch, useSelector } from "react-redux";
import {
  patchConversation,
  removeConversation,
  setConversations,
  setSelectedConversation,
} from "../redux/conversationSlice.js";
import logOut from "../features/logOut.js";
import { setUserdata } from "../redux/userSlice.js";
import BillingDrawer from "./BillingDrawer.jsx";
import { deleteConversation } from "../features/deleteConversation.js";
import { updateConversation } from "../features/updateConversation.js";
import { setActiveConversationId, setArtifacts, setIsLoading, setMessages } from "../redux/messageSlice.js";




function SideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();
  const [imageError, setImageError] = useState(false);
  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation,
  );
  const { userData } = useSelector((state) => state.user);
  const [showBilling, setShowBilling] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuId, setMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState(null);
  const [rename, setRename] = useState(null);
  const [railPanel, setRailPanel] = useState(null);



  const accountId = userData?._id || userData?.userId;

  useEffect(() => {
    let active = true;
    const getConv = async () => {
      if (!accountId) return;
      const data = await getConversations();
      if (!active) return;
      const list = Array.isArray(data) ? data : [];
      dispatch(setConversations(list));
      const latest = list
        .filter((conv) => !conv.archived)
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0];
      if (latest) {
        dispatch(setSelectedConversation(latest));
      }
    };
    getConv();
    return () => {
      active = false;
    };
  }, [accountId]);

  const startNewChat = () => {
    dispatch(setSelectedConversation(null));
    setMobileOpen(false);
  };

  const handleDeleteConversation = async (event, id) => {
    event.stopPropagation();
    setMenuId(null);
    setMenuPos(null);
    const deletingOpenChat = selectedConversation?._id == id;
    if (deletingOpenChat) {
      dispatch(setActiveConversationId(null));
      dispatch(setArtifacts([]));
      dispatch(setIsLoading(false));
    }
    try {
      await deleteConversation(id);
      dispatch(removeConversation(id));
      if (deletingOpenChat) {
        dispatch(setMessages([]));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveChatChange = async (id, fields) => {
    const updated = await updateConversation({ id, ...fields });
    if (updated?._id) {
      dispatch(patchConversation({ id, ...fields, pinnedAt: updated.pinnedAt }));
    }
    if (fields.archived && selectedConversation?._id == id) {
      const next = conversations.find((conv) => conv._id != id && !conv.archived);
      dispatch(setSelectedConversation(next || null));
    }
    setMenuId(null);
    setMenuPos(null);
  };

  const saveRename = async (event) => {
    event.preventDefault();
    if (!rename?.title?.trim()) return;
    await saveChatChange(rename.id, { title: rename.title.trim() });
    setRename(null);
  };

  const visibleChats = (conversations || [])
    .filter((conv) => showArchived ? conv.archived : !conv.archived)
    .filter((conv) => (conv.title || "New Chat").toLowerCase().includes(query.trim().toLowerCase()));
  const byNewest = (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
  const pinnedChats = showArchived
    ? []
    : visibleChats
        .filter((conv) => conv.pinned)
        .sort((a, b) => new Date(b.pinnedAt || 0) - new Date(a.pinnedAt || 0));
  const recentChats = (showArchived ? visibleChats : visibleChats.filter((conv) => !conv.pinned)).sort(byNewest);

  const openRailChat = (conv) => {
    dispatch(setSelectedConversation(conv));
    setRailPanel(null);
    setQuery("");
  };

  const railButton = (id, label, icon) => (
    <button
      title={label}
      className={`flex items-center justify-center w-9 h-9 rounded-xl border-none cursor-pointer transition-colors duration-150 ${
        railPanel === id ? "bg-white/10 text-slate-100" : "bg-transparent text-slate-500 hover:text-slate-200 hover:bg-white/5"
      }`}
      onClick={() => setRailPanel(railPanel === id ? null : id)}
    >
      {icon}
    </button>
  );

  if (collapsed) {
    const byUpdated = (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    const named = (conv) => (conv.title || "New Chat").toLowerCase().includes(query.trim().toLowerCase());
    const railPinned = (conversations || []).filter((conv) => conv.pinned && !conv.archived).sort((a, b) => new Date(b.pinnedAt || 0) - new Date(a.pinnedAt || 0));
    const railRecent = (conversations || []).filter((conv) => !conv.pinned && !conv.archived).sort(byUpdated);
    const railArchived = (conversations || []).filter((conv) => conv.archived).sort(byUpdated);
    const railSearch = (conversations || []).filter(named).sort(byUpdated);

    return (
      <div className="hidden lg:flex h-full w-14 shrink-0 flex-col items-center gap-1 border-r border-white/6 bg-[#0d0f14] py-4">
        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer"
          onClick={() => { setRailPanel(null); setCollapsed(false); }}
        >
          <PanelRight />
        </button>

        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer"
          onClick={() => { setRailPanel(null); startNewChat(); }}
        >
          <PenSquare size={17} />
        </button>

        {railButton("search", "Search chats", <Search size={17} />)}
        {railButton("chats", "Recent", <MessageSquare size={17} />)}

        {railPanel && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setRailPanel(null)} />
            <div className="fixed left-16 top-16 z-40 max-h-[70vh] w-[min(20rem,calc(100vw-5rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#2a2a2a] shadow-2xl">
              {railPanel === "search" ? (
                <div className="flex flex-col max-h-[70vh]">
                  <div className="flex items-center gap-2 border-b border-white/10 px-3 py-3">
                    <Search size={15} className="text-slate-400" />
                    <input
                      autoFocus
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search..."
                      className="w-full bg-transparent text-[14px] text-slate-100 outline-none placeholder:text-slate-500"
                    />
                  </div>
                  <div className="overflow-y-auto p-2">
                    <div className="px-2 py-1.5 text-[12px] text-slate-400">Recent chats</div>
                    {railSearch.map((conv) => (
                      <button key={conv._id} onClick={() => openRailChat(conv)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[14px] text-slate-100 hover:bg-white/10 bg-transparent border-none cursor-pointer">
                        <MessageSquare size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{conv.title || "New Chat"}</span>
                      </button>
                    ))}
                    {railSearch.length === 0 && <div className="px-2 py-3 text-[13px] text-slate-500">No chats found</div>}
                  </div>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[70vh] p-2">
                  {[{ label: "Pinned", items: railPinned }, { label: "Recents", items: railRecent }, { label: "Archived", items: railArchived }].map((section) => (
                    section.items.length > 0 && (
                      <div key={section.label} className="mb-2">
                        <div className="px-2 py-1.5 text-[12px] text-slate-400">{section.label}</div>
                        {section.items.map((conv) => (
                          <button key={conv._id} onClick={() => openRailChat(conv)} className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[14px] cursor-pointer border-none ${selectedConversation?._id == conv._id ? "bg-white/10 text-white" : "bg-transparent text-slate-100 hover:bg-white/10"}`}>
                            {section.label === "Pinned" ? <Pin size={14} className="text-slate-400 shrink-0" /> : section.label === "Archived" ? <Archive size={14} className="text-slate-400 shrink-0" /> : <MessageSquare size={14} className="text-slate-400 shrink-0" />}
                            <span className="truncate">{conv.title || "New Chat"}</span>
                          </button>
                        ))}
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex-1" />

        <div className="relative shrink-0">
          {userData?.avatar && !imageError ? (
            <img
              className="w-9 h-9 rounded-[10px] object-cover border-2 border-indigo-500/25"
              src={userData?.avatar}
              alt={"image"}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-9 h-9 rounded-[10px] bg-white/6 flex items-center justify-center">
              <User size={15} className="text-slate-400" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>

      <button
          className="lg:hidden fixed top-3.5 left-4 z-50 flex items-center justify-center w-8 h-8 rounded-lg bg-[#0d0f14] border border-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors duration-150 cursor-pointer"
          onClick={() => setMobileOpen(true)}
      >
          <Menu size={14} />
      </button>

      {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
      )}

      <div
        className={`fixed lg:static inset-y-0 left-0 z-[60] w-[270px] h-dvh max-h-dvh shrink-0 bg-[#0d0f14] border-r border-white/[0.06] transition-transform duration-250 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
      
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/6">
            <div
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer"
              onClick={() => setCollapsed(true)}
            >
              <PanelLeftIcon />
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
            >
              <X/>
            </button>

            <span className="text-[16px] font-semibold text-slate-100 tracking-tight flex-1">
              NexoraAI
            </span>

            <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full tracking-wide">
              {userData?.plan || "free"}
            </span>

            <button
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer"
              onClick={startNewChat}
            >
              <PenSquare size={14} />
            </button>
          </div>

          <div className="px-2 pt-2">
            <button
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[14px] text-slate-100 hover:bg-white/6 border-none bg-transparent cursor-pointer"
              onClick={startNewChat}
            >
              <PenSquare size={16} />
              New chat
            </button>
          </div>

          <div className="px-4 pt-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-3 py-2">
              <Search size={14} className="text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search chats"
                className="w-full bg-transparent text-[13px] text-slate-200 outline-none placeholder:text-slate-600"
              />
            </div>
            <button
              onClick={() => setShowArchived((current) => !current)}
              className="mt-2 text-[11px] text-slate-500 hover:text-slate-300"
            >
              {showArchived ? "Back to chats" : "Archived"}
            </button>
          </div>

          <div
            className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden"
            onScroll={() => {
              setMenuId(null);
              setMenuPos(null);
            }}
          >
            {[{ label: "Pinned", items: pinnedChats }, { label: showArchived ? "Archived" : "Recents", items: recentChats }].map((section) => (
              section.items.length > 0 && (
                <div key={section.label}>
                  <div className="px-2.5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600">
                    {section.label}
                  </div>
                  {section.items.map((conv) => {
                    const isActive = selectedConversation?._id == conv?._id;
                    return (
                      <div
                        key={conv._id}
                        onClick={() => {
                          dispatch(setSelectedConversation(conv));
                          setMenuId(null);
                          setMobileOpen(false);
                        }}
                        className={`group relative flex items-center gap-2 cursor-pointer mb-0.5 px-3 py-2 rounded-lg border transition-colors duration-150 ${
                          isActive
                            ? "bg-white/10 border-transparent"
                            : "bg-transparent border-transparent hover:bg-white/6"
                        }`}
                      >
                        {rename?.id == conv._id ? (
                          <form className="flex-1" onSubmit={saveRename} onClick={(event) => event.stopPropagation()}>
                            <input
                              autoFocus
                              value={rename.title}
                              onChange={(event) => setRename({ id: conv._id, title: event.target.value })}
                              onKeyDown={(event) => {
                                if (event.key === "Escape") setRename(null);
                              }}
                              className="w-full bg-transparent text-[13px] text-slate-100 outline-none"
                            />
                          </form>
                        ) : (
                          <span className="flex min-w-0 flex-1 items-center gap-1.5">
                            {conv.pinned && <Pin size={13} className="shrink-0 text-indigo-300" />}
                            <span className={`truncate text-[13px] font-medium ${isActive ? "text-slate-100" : "text-slate-300"}`}>
                              {conv?.title || "New Chat"}
                            </span>
                          </span>
                        )}
                        <button
                          className="shrink-0 text-slate-500 hover:text-slate-200"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (menuId == conv._id) {
                              setMenuId(null);
                              setMenuPos(null);
                              return;
                            }
                            const rect = event.currentTarget.getBoundingClientRect();
                            const menuHeight = 168;
                            const top = rect.bottom + menuHeight > window.innerHeight - 12
                              ? Math.max(8, rect.top - menuHeight)
                              : rect.bottom + 4;
                            setMenuPos({
                              top,
                              left: Math.max(8, Math.min(rect.right - 160, window.innerWidth - 168)),
                            });
                            setMenuId(conv._id);
                          }}
                        >
                          <MoreHorizontal size={15} />
                        </button>
                        {menuId == conv._id && menuPos && (
                          <div
                            className="fixed z-[70] w-40 rounded-xl border border-white/10 bg-[#1b1d27] p-1 shadow-xl"
                            style={{ top: menuPos.top, left: menuPos.left }}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-slate-200 hover:bg-white/5" onClick={() => { setRename({ id: conv._id, title: conv.title || "" }); setMenuId(null); }}>
                              <Pencil size={13} /> Rename
                            </button>
                            {!showArchived && (
                              <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-slate-200 hover:bg-white/5" onClick={() => saveChatChange(conv._id, { pinned: !conv.pinned })}>
                                <Pin size={13} /> {conv.pinned ? "Unpin" : "Pin"}
                              </button>
                            )}
                            <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-slate-200 hover:bg-white/5" onClick={() => saveChatChange(conv._id, { archived: !conv.archived })}>
                              <Archive size={13} /> {conv.archived ? "Unarchive" : "Archive"}
                            </button>
                            <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-red-400 hover:bg-white/5" onClick={(event) => handleDeleteConversation(event, conv._id)}>
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ))}
            {visibleChats.length == 0 && (
              <div className="px-5 pt-4 text-[12px] text-slate-600">
                {query ? "No matching chats" : "No conversations yet"}
              </div>
            )}
          </div>

          <div className="mx-2.5 h-px shrink-0 bg-white/10" />
          <div className="shrink-0 px-3.5 py-3 pb-[max(14px,env(safe-area-inset-bottom))]">
            {userData ? (
              <div className="flex items-center gap-2.5 cursor-pointer rounded-xl px-3 py-2.5 hover:bg-white/5 transistion-colors duration-150">
                <div className="relative shrink-0">
                  {userData?.avatar && !imageError ? (
                    <img
                      className="w-9 h-9 rounded-[10px] object-cover border-2 border-indigo-500/25"
                      src={userData?.avatar}
                      alt={"image"}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-[10px] bg-white/6 flex items-center justify-center">
                      <User size={15} className="text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold text-slate-100 truncate">
                    {userData?.name || "user"}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-px">
                    {`${userData?.plan}` || "free"}
                  </p>
                </div>

                <div className="flex gap-1">
                  <button 
                    onClick={() => setShowBilling((open) => !open)}
                    className="flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-yellow-600 cursor-pointer hover:bg-white/8 hover:text-slate-400 transition-all duration-150"
                  >
                    <Coins size={16} />
                  </button>
                  <button
                    className="flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-slate-600 cursor-pointer hover:bg-white/8 hover:text-slate-400 transition-all duration-150"
                    onClick={() => {
                      setMobileOpen(false);
                      logOut();
                      dispatch(setUserdata(null));
                    }}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button>Login</button>
            )}
          </div>
        </div>

      </div>

      <BillingDrawer
        open={showBilling}
        onClose={() => setShowBilling(false)}
      />
      
    </>
  );
}

export default SideBar;
