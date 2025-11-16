export type MetadataFormValues = {
  appName: string;
  baseUrl: string;
  titleDefault: string;
  titleTemplate: string;
  absoluteTitle?: string;
  description: string;
  keywords: string;
  authorName: string;
  authorUrl?: string;
  creator?: string;
  publisher?: string;
  themeColor: string;
  primaryColor: string;
  twitterHandle?: string;
  ogImagePath?: string;
  slug: string;
};

export function buildMetadataTs(values: MetadataFormValues): string {
  const {
    appName,
    baseUrl,
    titleDefault,
    titleTemplate,
    absoluteTitle,
    description,
    keywords,
    authorName,
    authorUrl,
    creator,
    publisher,
    themeColor,
    primaryColor,
    twitterHandle,
    ogImagePath,
    slug,
  } = values;

  const safeBaseUrl = baseUrl || "https://example.com";
  const iconBase = `/icons/${slug}`;

  const ogImageUrl = ogImagePath
    ? `${safeBaseUrl.replace(/\/$/, "")}${ogImagePath}`
    : `${safeBaseUrl.replace(/\/$/, "")}/${slug}-og.png`;

  const kws = keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return `import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("${safeBaseUrl}"),
  title: ${
    absoluteTitle
      ? `{ absolute: "${absoluteTitle}", template: "${titleTemplate}" }`
      : `{ default: "${titleDefault}", template: "${titleTemplate}" }`
  },
  description: "${description}",
  applicationName: "${appName}",
  authors: [
    {
      name: "${authorName}"${
        authorUrl ? `,\n      url: "${authorUrl}"` : ""
      }
    }
  ],
  generator: "MetaForge",
  keywords: ${JSON.stringify(kws)},
  referrer: "origin-when-cross-origin",
  // Deprecated viewport-related fields – consider using \`export const viewport\`
  themeColor: "${themeColor}",
  colorScheme: "dark",
  viewport: "width=device-width, initial-scale=1",
  creator: ${creator ? `"${creator}"` : `"${authorName}"`},
  publisher: ${publisher ? `"${publisher}"` : `"${appName}"`},
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "${safeBaseUrl}",
    languages: {
      "en-US": "${safeBaseUrl}/en-US",
    },
  },
  icons: {
    icon: [
      { url: "${iconBase}-icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "${iconBase}-icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "${iconBase}-icon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "${iconBase}-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",

  openGraph: {
    type: "website",
    url: "${safeBaseUrl}",
    title: "${titleDefault}",
    description: "${description}",
    siteName: "${appName}",
    images: [
      {
        url: "${ogImageUrl}",
        width: 1200,
        height: 630,
        alt: "${appName} – Open Graph image",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: ${twitterHandle ? `"${twitterHandle}"` : "undefined"},
    creator: ${twitterHandle ? `"${twitterHandle}"` : "undefined"},
    title: "${titleDefault}",
    description: "${description}",
    images: ["${ogImageUrl}"],
  },

  facebook: {
    appId: undefined,
  },

  pinterest: {
    richPin: true,
  },

  verification: {
    google: "",
    yandex: "",
    bing: "",
    me: "",
  },

  appleWebApp: {
    capable: true,
    title: "${appName}",
    statusBarStyle: "black-translucent",
  },

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  itunes: {
    appId: undefined,
    appArgument: undefined,
  },

  abstract: "${description}",

  appLinks: {
    web: {
      url: "${safeBaseUrl}",
      should_fallback: true,
    },
  },

  archives: [],
  assets: [],
  bookmarks: [],
  pagination: {
    previous: null,
    next: null,
  },

  category: "application",
  classification: "web application",

  other: {
    "theme-primary": "${primaryColor}",
  },
};
`;
}
