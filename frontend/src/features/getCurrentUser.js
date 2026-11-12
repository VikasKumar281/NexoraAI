import api from "../../utils/axios.js";

const getCurrentUser=async() =>{
    try {
        const {data} = await api.get("/api/me")
        return data
    } 
    catch (error) {
        console.log(error)
        return null
    }
}

export function applySession(current, session) {
    if (!session) return current;
    return {
        ...(current || {}),
        ...session,
        _id: current?._id || session.userId || session._id,
    };
}

export default getCurrentUser;