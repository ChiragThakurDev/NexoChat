import axios from "axios";

// const BASE_URL =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:3000/api"
//     : "https://next-chat-self-three.vercel.app/api";

export const axiosInstance = axios.create({
  baseURL: "https://next-chat-self-three.vercel.app/api",
  withCredentials: true,
});
