import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { notFound, redirect } from "next/navigation";
import MenuPageClient from "../../../../t/[truckId]/page";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: {
    state: string;
    city: string;
    slug: string;
  };
}

// ─── Dynamic SEO Metadata ─────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const truck = await fetchQuery(api.foodTrucks.getTruckBySlug, {
    state: params.state,
    city: params.city,
    slug: params.slug,
  });

  if (!truck) {
    return { title: "Food Truck não encontrado" };
  }

  const cityName = truck.cityDisplay;
  const stateName = truck.stateDisplay;
  const title = `${truck.name} — Cardápio e Pedidos | ${cityName}, ${stateName}`;
  const description = `Peça online no ${truck.name}, food truck de ${truck.cuisine} em ${cityName}. ${truck.description.slice(0, 120)}...`;
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/menu/${params.state}/${params.city}/${params.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: truck.coverPhotoUrl
        ? [{ url: truck.coverPhotoUrl, width: 1200, height: 630, alt: truck.name }]
        : [],
      locale: "pt_BR",
      siteName: "Food Truck Alert",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: truck.coverPhotoUrl ? [truck.coverPhotoUrl] : [],
    },
    alternates: {
      canonical: url,
    },
    keywords: [
      truck.name,
      truck.cuisine,
      `food truck ${cityName}`,
      `${truck.cuisine} ${cityName}`,
      `pedir comida ${cityName}`,
      `food truck ${stateName}`,
      "delivery food truck",
      "cardápio online",
    ],
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────

function JsonLd({ truck, params }: { truck: any; params: PageProps["params"] }) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/menu/${params.state}/${params.city}/${params.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: truck.name,
    description: truck.description,
    url,
    telephone: truck.phone,
    image: truck.coverPhotoUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: truck.cityDisplay,
      addressRegion: truck.stateDisplay,
      addressCountry: "BR",
      streetAddress: truck.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: truck.latitude,
      longitude: truck.longitude,
    },
    aggregateRating: truck.totalReviews > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: truck.rating,
          reviewCount: truck.totalReviews,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    servesCuisine: truck.cuisine,
    openingHoursSpecification: buildOpeningHours(truck.openingHours),
    menu: url,
    hasMap: `https://maps.google.com/?q=${truck.latitude},${truck.longitude}`,
    priceRange: "R$",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function buildOpeningHours(hours: Record<string, { open: string; close: string } | undefined>) {
  const dayMap: Record<string, string> = {
    monday: "Mo", tuesday: "Tu", wednesday: "We",
    thursday: "Th", friday: "Fr", saturday: "Sa", sunday: "Su",
  };
  return Object.entries(hours ?? {})
    .filter(([, h]) => h)
    .map(([day, h]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${dayMap[day]}`,
      opens: h!.open,
      closes: h!.close,
    }));
}

// ─── Breadcrumb JSON-LD ───────────────────────────────────────────────────────

function BreadcrumbJsonLd({ truck, params }: { truck: any; params: PageProps["params"] }) {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: base },
      { "@type": "ListItem", position: 2, name: truck.stateDisplay, item: `${base}/menu/${params.state}` },
      { "@type": "ListItem", position: 3, name: truck.cityDisplay, item: `${base}/menu/${params.state}/${params.city}` },
      { "@type": "ListItem", position: 4, name: truck.name, item: `${base}/menu/${params.state}/${params.city}/${params.slug}` },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MenuSlugPage({ params }: PageProps) {
  const truck = await fetchQuery(api.foodTrucks.getTruckBySlug, {
    state: params.state,
    city: params.city,
    slug: params.slug,
  });

  if (!truck) notFound();

  return (
    <>
      <JsonLd truck={truck} params={params} />
      <BreadcrumbJsonLd truck={truck} params={params} />
      {/* Reutiliza o componente client existente, passando o truckId real */}
      <MenuPageClient params={{ truckId: truck._id }} />
    </>
  );
}

// ─── Static params para pre-rendering (SSG) ───────────────────────────────────

/*
export async function generateStaticParams() {
  const trucks = await fetchQuery(api.foodTrucks.getAllTrucks, {});
  return trucks.map((truck) => ({
    state: truck.state,
    city: truck.city,
    slug: truck.slug,
  }));
}
*/
