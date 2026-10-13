import { useRouter } from "expo-router";
import { StateScreen } from "@/components/apongram/StateScreen";
import { useLanguage } from "@/lib/apongram/LanguageContext";
export default function OtpErrorScreen() { const router = useRouter(); const { copy } = useLanguage(); return <StateScreen icon="error-outline" variant="error" title={copy.otpErrorTitle} body={copy.otpErrorBody} action={copy.retry} onAction={() => router.replace("/auth/phone")} />; }
