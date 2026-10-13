import { useRouter } from "expo-router";
import { StateScreen } from "@/components/apongram/StateScreen";
import { useLanguage } from "@/lib/apongram/LanguageContext";
export default function OfflineScreen() { const router = useRouter(); const { copy } = useLanguage(); return <StateScreen icon="cloud-off" variant="offline" title={copy.offlineTitle} body={copy.offlineBody} banner={copy.offlineBanner} action={copy.back} onAction={() => router.back()} />; }
