import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { isValidEmailAddress } from "./email-validation";
import { supabaseConfig } from "./supabase-config";

const SESSION_KEY = "ekta.supabase.session";
const OTP_PHONE_KEY = "ekta.supabase.otp.phone";
const OTP_EMAIL_KEY = "ekta.supabase.otp.email";

export type SupabaseUser = {
  id: string;
  phone?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: SupabaseUser;
};

export type SupabaseAuthResponse = Partial<SupabaseSession> & {
  user?: SupabaseUser;
  msg?: string;
};

export class SupabaseAuthError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "SupabaseAuthError";
  }
}

async function readValue(key: string): Promise<string | null> {
  if (Platform.OS === "web") return typeof window === "undefined" ? null : window.localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function writeValue(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeValue(key: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

function requireConfigured(): void {
  if (!supabaseConfig.isConfigured) throw new SupabaseAuthError("Supabase is not configured");
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  throw new SupabaseAuthError("Enter a valid Indian mobile number");
}

function normalizeEmail(emailInput: string): string {
  const email = emailInput.trim().toLowerCase();
  if (!isValidEmailAddress(email)) {
    throw new SupabaseAuthError("Enter a valid email address");
  }
  return email;
}

async function authRequest<T>(path: string, init: RequestInit, redirectTo?: string): Promise<T> {
  requireConfigured();
  const requestUrl = new URL(`/auth/v1/${path}`, `${supabaseConfig.url.replace(/\/+$/, "")}/`);
  if (redirectTo) requestUrl.searchParams.set("redirect_to", redirectTo);
  const response = await fetch(requestUrl.toString(), {
    ...init,
    headers: {
      apikey: supabaseConfig.anonKey,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    let message = `Authentication failed (${response.status})`;
    try {
      const payload = await response.json() as { msg?: string; message?: string; error_description?: string };
      message = payload.msg ?? payload.message ?? payload.error_description ?? message;
    } catch {
      // Keep the status-based message when Supabase returns a non-JSON error.
    }
    throw new SupabaseAuthError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function sendEmailOtp(emailInput: string, redirectTo: string): Promise<void> {
  const email = normalizeEmail(emailInput);
  if (!redirectTo.trim()) throw new SupabaseAuthError("Email sign-in redirect URL is missing");
  await authRequest("otp", {
    method: "POST",
    body: JSON.stringify({ email, create_user: true }),
  }, redirectTo);
  await writeValue(OTP_EMAIL_KEY, email);
}

export async function verifyEmailOtp(otpInput: string, emailInput?: string): Promise<SupabaseSession> {
  const email = normalizeEmail(emailInput ?? (await readValue(OTP_EMAIL_KEY) ?? ""));
  const token = otpInput.replace(/\D/g, "");
  if (!/^\d{6}$/.test(token)) throw new SupabaseAuthError("Enter the 6-digit OTP");
  const session = await authRequest<SupabaseSession>("token?grant_type=otp", {
    method: "POST",
    body: JSON.stringify({ email, token, type: "email" }),
  });
  await saveSupabaseSession(session);
  await removeValue(OTP_EMAIL_KEY);
  return session;
}

export async function signUpWithEmail(emailInput: string, password: string, fullName: string): Promise<SupabaseAuthResponse> {
  const email = normalizeEmail(emailInput);
  if (password.length < 8) throw new SupabaseAuthError("Password must be at least 8 characters");
  const response = await authRequest<SupabaseAuthResponse>("signup", {
    method: "POST",
    body: JSON.stringify({ email, password, data: { full_name: fullName.trim() } }),
  });
  if (response.access_token && response.refresh_token && response.user) {
    await saveSupabaseSession(response as SupabaseSession);
  }
  return response;
}

export async function signInWithEmail(emailInput: string, password: string): Promise<SupabaseSession> {
  const email = normalizeEmail(emailInput);
  if (!password) throw new SupabaseAuthError("Enter your password");
  const session = await authRequest<SupabaseSession>("token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await saveSupabaseSession(session);
  return session;
}

export async function resendSignupVerification(emailInput: string): Promise<void> {
  const email = normalizeEmail(emailInput);
  await authRequest("resend", {
    method: "POST",
    body: JSON.stringify({ type: "signup", email }),
  });
}

export function getGoogleOAuthUrl(redirectTo: string): string {
  requireConfigured();
  const params = new URLSearchParams({ provider: "google", redirect_to: redirectTo, response_type: "token" });
  return `${supabaseConfig.url}/auth/v1/authorize?${params.toString()}`;
}

export async function completeSupabaseRedirect(callbackUrl: string): Promise<SupabaseSession> {
  const parsed = new URL(callbackUrl);
  const fragment = new URLSearchParams(parsed.hash.replace(/^#/, ""));
  const query = parsed.searchParams;
  const error = fragment.get("error_description") ?? query.get("error_description") ?? fragment.get("error") ?? query.get("error") ?? fragment.get("error_code") ?? query.get("error_code");
  if (error) throw new SupabaseAuthError(error);
  const accessToken = fragment.get("access_token") ?? query.get("access_token");
  const refreshToken = fragment.get("refresh_token") ?? query.get("refresh_token");
  if (!accessToken || !refreshToken) throw new SupabaseAuthError("Supabase sign-in did not return a session");
  const user = await authRequest<SupabaseUser>("user", { method: "GET", headers: { Authorization: `Bearer ${accessToken}` } });
  const expiresIn = Number(fragment.get("expires_in") ?? query.get("expires_in") ?? 3600);
  const expiresAt = Number(fragment.get("expires_at") ?? query.get("expires_at") ?? Math.floor(Date.now() / 1000) + expiresIn);
  const session: SupabaseSession = { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn, expires_at: expiresAt, token_type: fragment.get("token_type") ?? "bearer", user };
  await saveSupabaseSession(session);
  return session;
}

export async function completeGoogleOAuthRedirect(callbackUrl: string): Promise<SupabaseSession> {
  return completeSupabaseRedirect(callbackUrl);
}

export async function sendPhoneOtp(phoneInput: string): Promise<void> {
  const phone = normalizePhone(phoneInput);
  await authRequest("otp", {
    method: "POST",
    body: JSON.stringify({ phone, create_user: true }),
  });
  await writeValue(OTP_PHONE_KEY, phone);
}

export async function verifyPhoneOtp(otpInput: string, phoneInput?: string): Promise<SupabaseSession> {
  const phone = normalizePhone(phoneInput ?? (await readValue(OTP_PHONE_KEY) ?? ""));
  const token = otpInput.replace(/\D/g, "");
  if (!/^\d{6}$/.test(token)) throw new SupabaseAuthError("Enter the 6-digit OTP");
  const session = await authRequest<SupabaseSession>("token?grant_type=otp", {
    method: "POST",
    body: JSON.stringify({ phone, token, type: "sms" }),
  });
  await saveSupabaseSession(session);
  await removeValue(OTP_PHONE_KEY);
  return session;
}

export async function saveSupabaseSession(session: SupabaseSession): Promise<void> {
  const expiresAt = session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in;
  await writeValue(SESSION_KEY, JSON.stringify({ ...session, expires_at: expiresAt }));
}

export async function getSupabaseSession(): Promise<SupabaseSession | null> {
  const raw = await readValue(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SupabaseSession;
  } catch {
    await removeValue(SESSION_KEY);
    return null;
  }
}

export async function getSupabaseAccessToken(): Promise<string | null> {
  const session = await getSupabaseSession();
  if (!session) return null;
  if ((session.expires_at ?? 0) > Math.floor(Date.now() / 1000) + 30) return session.access_token;
  if (!session.refresh_token) return null;
  try {
    const refreshed = await authRequest<SupabaseSession>("token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    await saveSupabaseSession(refreshed);
    return refreshed.access_token;
  } catch {
    await clearSupabaseSession();
    return null;
  }
}

export async function clearSupabaseSession(): Promise<void> {
  const token = await getSupabaseSession().then((session) => session?.access_token ?? null);
  if (token && supabaseConfig.isConfigured) {
    try {
      await authRequest("logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    } catch {
      // Local session must still be cleared if remote logout fails.
    }
  }
  await removeValue(SESSION_KEY);
  await removeValue(OTP_PHONE_KEY);
  await removeValue(OTP_EMAIL_KEY);
}
