import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "next-chat-self-three.vercel.app/api",
  withCredentials: true,
});
