import { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../convex/_generated/api";

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
  const cities = Array.from(
    new Map(trucks.map((t) => [`${t.state}/${t.city}`, t] as const)).values()
  );
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
