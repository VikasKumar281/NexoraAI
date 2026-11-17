export function modelText(content) {
    if (typeof content === "string") return content
    if (Array.isArray(content)) {
        return content.map((part) => {
            if (typeof part === "string") return part
            return part?.text || part?.content || ""
        }).join("")
    }
    return ""
}

export function readModelJson(content) {
    const text = modelText(content).trim()
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
    const body = (fenced ? fenced[1] : text).trim()
    const start = body.indexOf("{")
    const end = body.lastIndexOf("}")
    if (start < 0 || end <= start) {
        throw new Error("The model did not return JSON")
    }
    return JSON.parse(body.slice(start, end + 1))
}
