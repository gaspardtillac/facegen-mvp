import SessionProviders from "../components/SessionProviders";

export const metadata = {
  metadataBase: new URL("https://mon-avatar-ia.vercel.app"),
  title: {
    default: "Mon Avatar IA — Créez des avatars pros à partir de votre photo",
    template: "%s · Mon Avatar IA",
  },
  description:
    "Générez un avatar professionnel et élégant à partir de votre photo. 3 crédits gratuits pour essayer, puis packs abordables.",
  openGraph: {
    title: "Mon Avatar IA — Créez des avatars pros à partir de votre photo",
    description:
      "Générez un avatar professionnel et élégant à partir de votre photo. 3 crédits gratuits pour essayer, puis packs abordables.",
    url: "/",
    siteName: "Mon Avatar IA",
    images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630, alt: "Mon Avatar IA" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mon Avatar IA",
    description:
      "Générez un avatar professionnel et élégant à partir de votre photo. 3 crédits gratuits pour essayer.",
    images: ["/images/og-cover.jpg"],
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mon Avatar IA",
    url: "https://mon-avatar-ia.vercel.app",
    description:
      "Créez un avatar professionnel à partir de votre photo. 3 crédits gratuits disponibles.",
    applicationCategory: "PhotoEditorApplication",
    inLanguage: "fr-FR",
  };

  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Si tu utilises Google Search Console, remplace la valeur ci-dessous */}
        <meta name="google-site-verification" content="PASTE_TOKEN_HERE" />
        <script
          type="application/ld+json"
          // @ts-ignore
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="robots" content="index,follow" />
      </head>
      <body style={{ margin: 0 }}>
        <SessionProviders>{children}</SessionProviders>
      </body>
    </html>
  );
}
