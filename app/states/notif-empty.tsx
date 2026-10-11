import { useRouter } from "expo-router";
import { StateScreen } from "@/components/apongram/StateScreen";
import { useLanguage } from "@/lib/apongram/LanguageContext";
export default function NotifEmptyScreen() { const router = useRouter(); const { copy } = useLanguage(); return <StateScreen icon="notifications-none" title={copy.noNotifications} body={copy.noNotificationsBody} action={copy.create} onAction={() => router.push("/(tabs)/create")} />; }
