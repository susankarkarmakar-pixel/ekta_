import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/apongram/supabase-config", () => ({
  supabaseConfig: {
    url: "https://project-ref.supabase.co/",
    anonKey: "sb_publishable_test_key",
    isConfigured: true,
  },
}));
vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn().mockResolvedValue(null),
  setItemAsync: vi.fn().mockResolvedValue(undefined),
  deleteItemAsync: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

import { sendEmailOtp } from "../lib/apongram/supabase-auth";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("Supabase email OTP redirect", () => {
  it("sends the callback URL as redirect_to on the OTP request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);
    const redirectTo = "https://ekta-pied.vercel.app/auth/phone";

    await sendEmailOtp("  PERSON@example.com  ", redirectTo);

    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const parsedUrl = new URL(requestUrl);
    expect(parsedUrl.pathname).toBe("/auth/v1/otp");
    expect(parsedUrl.searchParams.get("redirect_to")).toBe(redirectTo);
    expect(JSON.parse(String(requestInit.body))).toEqual({
      email: "person@example.com",
      create_user: true,
    });
  });

  it("rejects a missing redirect destination before calling Supabase", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendEmailOtp("person@example.com", " ")).rejects.toThrow("Email sign-in redirect URL is missing");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
