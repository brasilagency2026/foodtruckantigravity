import { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../convex/_generated/api";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://foodpronto.com.br";
  const trucks = await fetchQuery(api.foodTrucks.getAllTrucks, {});

  const truckUrls: MetadataRoute.Sitemap = trucks.map((truck) => ({
    url: `${base}/menu/${truck.state}/${truck.city}/${truck.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Páginas de cidade (listagem de trucks por cidade)
  const cityMap = new Map<string, typeof trucks[number]>();
  for (const t of trucks) {
    cityMap.set(`${t.state}/${t.city}`, t);
  }
  const cities = Array.from(cityMap.values());
  const cityUrls: MetadataRoute.Sitemap = cities.map((t) => ({
    url: `${base}/menu/${t.state}/${t.city}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/onboarding`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...cityUrls,
    ...truckUrls,
  ];
}
