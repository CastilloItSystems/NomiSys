import Layout from "@/layout/layout";
import { Metadata } from "next";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "NomiSys",
  description: "NomiSys Refinery.",
  robots: { index: false, follow: false },
  viewport: { initialScale: 1, width: "device-width" },
  openGraph: {
    type: "website",
    title: "NomiSys",
    url: "https://www.NomiSys.com.ve",
    description: "NomiSys Refinery.",

    ttl: 604800,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

// export const viewport = {
//   width: "device-width",
//   initialScale: 1,
// };

export default function MainLayout({ children }: MainLayoutProps) {
  return <Layout>{children}</Layout>;
}
