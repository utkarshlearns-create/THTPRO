import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "The Home Tuitions Pro - Find Verified Tutors Near You",
  description: "THTPRO is a smart tutor-parent matching platform. Find verified, background-checked tutors for your child. Post teaching requirements or apply as a tutor.",
  keywords: "tutor, home tuition, online tutoring, find tutor, THTPRO, verified tutors, India",
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
