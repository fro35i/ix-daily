const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const site = {
  name: "IBM iX Daily",
  description:
    "Daily reading from the IBM iX blog: experience design, technology and business transformation.",
  url: new URL(
    productionHost ? `https://${productionHost}` : "http://localhost:3002",
  ),
  locale: "en_US",
} as const;
