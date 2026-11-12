import api from "../../utils/axios.js";

export const deleteConversation = async (id) => {
    const { data } = await api.delete(`/api/chat/delete-conversation/${id}`);
    return data;
};
