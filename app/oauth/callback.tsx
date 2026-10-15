import { ThemedView } from "@/components/themed-view";
import {
  completeGoogleOAuthRedirect,
  getSupabaseSession,
} from "@/lib/apongram/supabase-auth";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OAuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{ error?: string }>();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const url =
          typeof window !== "undefined" && window.location.href
            ? window.location.href
            : await Linking.getInitialURL();
        if (params.error) throw new Error(params.error);
        if (!url)
          throw new Error("The Supabase OAuth callback URL was not found");
        await completeGoogleOAuthRedirect(url);
        if (!(await getSupabaseSession()))
          throw new Error("Supabase session was not persisted");
        setStatus("success");
        setTimeout(() => router.replace("/(tabs)"), 800);
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to complete authentication",
        );
      }
    };

    void handleCallback();
  }, [params.error, router]);

  return (
    <SafeAreaView className="flex-1" edges={["top", "bottom", "left", "right"]}>
      <ThemedView className="flex-1 items-center justify-center gap-4 p-5">
        {status === "processing" ? (
          <>
            <ActivityIndicator size="large" />
            <Text className="mt-4 text-base leading-6 text-center text-foreground">
              Completing authentication…
            </Text>
          </>
        ) : null}
        {status === "success" ? (
          <>
            <Text className="text-base leading-6 text-center text-foreground">
              Authentication successful.
            </Text>
            <Text className="text-base leading-6 text-center text-foreground">
              Redirecting…
            </Text>
          </>
        ) : null}
        {status === "error" ? (
          <>
            <Text className="mb-2 text-xl font-bold leading-7 text-error">
              Authentication failed
            </Text>
            <Text className="text-base leading-6 text-center text-foreground">
              {errorMessage}
            </Text>
          </>
        ) : null}
      </ThemedView>
    </SafeAreaView>
  );
}
