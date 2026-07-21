import axios from "axios";

export const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("smart_cafe_auth_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});