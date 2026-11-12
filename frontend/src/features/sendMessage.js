import api from "../../utils/axios.js";

async function sendMessage(payload, signal){
    try {
      const { data } = await api.post("/api/agent/chat", payload, { signal })
      return data 
    } 
    catch (error) {
        if (error?.code === "ERR_CANCELED") return null
        console.log(error)
        return null
    }
}

export default sendMessage