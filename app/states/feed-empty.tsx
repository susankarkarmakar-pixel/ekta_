import { useRouter } from "expo-router";
import { StateScreen } from "@/components/apongram/StateScreen";
import { useLanguage } from "@/lib/apongram/LanguageContext";
export default function FeedEmptyScreen() { const router = useRouter(); const { copy } = useLanguage(); return <StateScreen icon="dynamic-feed" title={copy.feedEmptyTitle} body={copy.feedEmptyBody} action={copy.create} onAction={() => router.push("/(tabs)/create")} />; }
