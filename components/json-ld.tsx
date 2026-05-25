type JsonLdProps = {
  data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      type="application/ld+json"
    />
  );
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://skhotel.com.vn";

export const hotelJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  name: "SK Boutique Hotel Phú Quốc",
  url: siteUrl,
  telephone: "+84908233583",
  email: "skhotel.phuquoc@gmail.com",
  image: [
    `${siteUrl}/assets/room_types/family/1.png`,
    `${siteUrl}/assets/room_types/superior/1.png`,
    `${siteUrl}/assets/room_types/quadruple/1.png`
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "MP-135, Marina Square, Khu nghỉ dưỡng phức hợp Marina, Ấp Đường Bào",
    addressLocality: "Phú Quốc",
    addressRegion: "Kiên Giang",
    postalCode: "92509",
    addressCountry: "VN"
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 10.2913,
    longitude: 103.9837
  },
  priceRange: "$$",
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Family Room", value: true },
    { "@type": "LocationFeatureSpecification", name: "Superior Room", value: true },
    { "@type": "LocationFeatureSpecification", name: "Quadruple Room", value: true },
    { "@type": "LocationFeatureSpecification", name: "Free WiFi", value: true }
  ],
  sameAs: ["https://www.facebook.com/skhotel.phuquoc"]
};

export const organizationJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SK Boutique Hotel",
  url: siteUrl,
  logo: `${siteUrl}/favicon-512.png`,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+84908233583",
    contactType: "customer service",
    availableLanguage: ["Vietnamese", "English"]
  }
};

export const websiteJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SK Boutique Hotel",
  url: siteUrl
};

export function roomsBreadcrumbJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Phòng", item: `${siteUrl}/rooms` }
    ]
  };
}

export function roomDetailBreadcrumbJsonLd(roomName: string, roomSlug: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Phòng", item: `${siteUrl}/rooms` },
      { "@type": "ListItem", position: 3, name: roomName, item: `${siteUrl}/rooms/${roomSlug}` }
    ]
  };
}
