import axios from "axios";
import { supabase } from "./supabase";

export const api = axios.create({
  baseURL: "https://192.168.1.164:8000",
});

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});
