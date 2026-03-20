import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "The Home Tuitions Pro - Find Verified Tutors Near You",
  description: "Find verified, background-checked home tutors near you in Lucknow. 5000+ tutors, free demo class, rated 4.8/5 by parents. Post your requirement today.",
  keywords: "home tutor, home tuition, tutor near me, verified tutors, lucknow tutor, home tutors lucknow, online tuition",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  verification: {
    google: "Xne7h9KLDEcV8spdfJSZaNI3HJ8NZCk2Femb2YHRz8I",
  },
  openGraph: {
    title: "The Home Tuitions - Find Verified Home Tutors Near You",
    description: "Connect with verified, background-checked home tutors in Lucknow. Free demo class. 5000+ tutors. Rated 4.8/5.",
    url: "https://www.thehometuitions.com",
    siteName: "The Home Tuitions",
    images: [
      {
        url: "https://www.thehometuitions.com/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "The Home Tuitions - Find Verified Tutors",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Home Tuitions - Find Verified Home Tutors Near You",
    description: "Connect with verified home tutors in Lucknow. Free demo class. 5000+ tutors. Rated 4.8/5.",
    images: ["https://www.thehometuitions.com/og-banner.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
