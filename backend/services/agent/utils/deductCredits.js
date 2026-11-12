import axios from "axios";
import { deductCredits as deductCreditsHandler } from "../../auth/controllers/auth.controller.js";
import { callHandler } from "../../../shared/callHandler.js";

export const deductCredits = async (userId, agent) => {
  try {
    if (process.env.AUTH_SERVICE) {
      const { data } = await axios.post(
        `${process.env.AUTH_SERVICE}/deduct-credits`,
        { userId, agent }
      );
      return data;
    }

    return await callHandler(deductCreditsHandler, {
      body: { userId, agent }
    });
  } catch (error) {
    console.log(error);
    return null;
  }
};