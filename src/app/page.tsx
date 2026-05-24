import { getLocale } from "@/lib/i18n-server";
import HomePageClient from "./page-client";

export default async function HomePage() {
  const locale = await getLocale();

  return <HomePageClient locale={locale} />;
}