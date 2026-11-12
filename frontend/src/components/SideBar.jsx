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
  Plus,
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
  const [rename, setRename] = useState(null);



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
    try {
      await deleteConversation(id);
      dispatch(removeConversation(id));
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

  if (collapsed) {
    return (
      <div className="hidden lg:flex flex-col items-center w-14 h-screen bg-[#0d0f14] border-r border-white/6 py-4 gap-1 shrink-0">
        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer"
          onClick={() => setCollapsed(false)}
        >
          <PanelRight />
        </button>

        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer"
          onClick={startNewChat}
        >
          <PenSquare size={17} />
        </button>

        <div className="flex-1 overflow-y-auto px-2.5 pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden pt-5">
          {conversations.filter((conv) => !conv.archived).map((conv) => {
            const isActive = selectedConversation?._id == conv?._id;

            return (
              <div
                key={conv._id}
                onClick={() => dispatch(setSelectedConversation(conv))}
                className={`flex items-center gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 rounded-[10px] border transition-colors duration-150 ${
                  isActive
                    ? "bg-indigo-500/10 border-indigo-500/10"
                    : "bg-transparent border-transparent hover:bg-white/5"
                }`}
              >
                <div
                  className={`flex items-center justify-center shrink-0 w-5 h-5 rounded-lg transition-colors duration-150 ${
                    isActive
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  <MessageSquare size={13} />
                </div>
              </div>
            );
          })}
        </div>

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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[270px] h-screen shrink-0 bg-[#0d0f14] border-r border-white/[0.06] transition-transform duration-250 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
      
        <div className="flex flex-col h-full">
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

          <div className="px-4 pt-4 pb-1">
            <button
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-linear-to-br from-indigo-500 to-violet-700 rounded-xl py-2.5 border-none cursor-pointer hover:opacity-90 transition-opacity duration-150"
              onClick={startNewChat}

            >
              <Plus size={15} />
              New Chat
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

          <div className="flex-1 overflow-y-auto px-2.5 pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
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
                        className={`group relative flex items-center gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 rounded-[10px] border transition-colors duration-150 ${
                          isActive
                            ? "bg-indigo-500/10 border-indigo-500/10"
                            : "bg-transparent border-transparent hover:bg-white/5"
                        }`}
                      >
                        <MessageSquare size={13} className={isActive ? "text-indigo-400" : "text-slate-500"} />
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
                          <span className={`text-[13px] font-medium truncate flex-1 ${isActive ? "text-slate-100" : "text-slate-300"}`}>
                            {conv?.title || "New Chat"}
                          </span>
                        )}
                        {conv.pinned && <Pin size={12} className="text-indigo-400" />}
                        <button
                          className="shrink-0 text-slate-500 hover:text-slate-200"
                          onClick={(event) => {
                            event.stopPropagation();
                            setMenuId(menuId == conv._id ? null : conv._id);
                          }}
                        >
                          <MoreHorizontal size={15} />
                        </button>
                        {menuId == conv._id && (
                          <div
                            className="absolute right-2 top-10 z-20 w-40 rounded-xl border border-white/10 bg-[#1b1d27] p-1 shadow-xl"
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

          <div className="mx-2.5 h-px bg-white/60" />
          <div className="px-3.5 py-3.5">
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
                    onClick={() => setShowBilling(true)}
                    className="flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-yellow-600 cursor-pointer hover:bg-white/8 hover:text-slate-400 transition-all duration-150"
                  >
                    <Coins size={16} />
                  </button>
                  <button
                    className="flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-slate-600 cursor-pointer hover:bg-white/8 hover:text-slate-400 transition-all duration-150"
                    onClick={() => {
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
