import api from "../../utils/axios.js";

export const verifyPayment = async (payload) => {
  try {
    const { data } = await api.post("/api/billing/verify", payload);
    return data;
  } catch (error) {
    console.error(
      "Verify Payment Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};