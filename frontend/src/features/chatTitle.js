const LEADING_FILLER =
  /^(please|pls|kindly|can you|could you|would you|i want you to|i want to|i need you to|i need to|help me|hey|hi|hello|hii|bro|dear|namaste)\b[\s,]*/i;

export function makeChatTitle(prompt) {
  const original = String(prompt || "").replace(/\s+/g, " ").trim();
  if (!original) return "New chat";

  let text = original.split("\n")[0].split(/(?<=[.?!])\s/)[0].replace(/[.?!]+$/, "").trim();
  let previous = "";
  while (text && text !== previous) {
    previous = text;
    text = text.replace(LEADING_FILLER, "").trim();
  }
  text = text.replace(/\b(please|for me|bro)\b/gi, "").replace(/\s+/g, " ").trim();
  if (text.length < 2) text = original.replace(/[.?!]+$/, "").trim();

  let title = text.split(" ").filter(Boolean).slice(0, 6).join(" ");
  if (title.length > 46) {
    const cut = title.lastIndexOf(" ", 46);
    title = title.slice(0, cut > 12 ? cut : 46).trim();
  }
  return title.charAt(0).toUpperCase() + title.slice(1);
}
