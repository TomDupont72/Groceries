import { supabase } from "../api/supabase";

export class ApiError extends Error {
  public code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export async function getAppConfig() {
  const { data, error } = await supabase.from("AppConfig").select("name,value");

  if (error) throw new ApiError(error.message, error.code);

  return data;
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw new ApiError(error.message, error.code);
  if (!user?.id) throw new ApiError("Utilisateur non connecté", "401");

  return user;
}

export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from("User")
    .select("username,userId")
    .eq("userId", userId)
    .single();

  if (error) throw new ApiError(error.message, error.code);

  return data;
}

export async function supabaseSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw new ApiError(error.message, error.code);

  return data;
}

export async function supabaseSignUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });

  if (error) throw new ApiError(error.message, error.code);

  return data;
}

export async function insertUser(userId: string | undefined, username: string) {
  const { data, error } = await supabase
    .from("User")
    .insert({ userId, username })
    .select("userId,username")
    .single();

  if (error) throw new ApiError(error.message, error.code);

  return data;
}

export async function supabaseGetSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw new ApiError(error.message, error.code);

  return session;
}

export async function supabaseSignOut() {
  const { error } = await supabase.auth.signOut();

  if (error) throw new ApiError(error.message, error.code);
}
