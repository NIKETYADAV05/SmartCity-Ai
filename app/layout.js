import "./globals.css";

export const metadata = {
  title: {
    default: "SmartCity AI",
    template: "%s | SmartCity AI",
  },
  description:
    "SmartCity AI — Intelligent Urban Management & Citizen Service Platform.",
  keywords: ["smart city", "urban management", "citizen services", "city issues"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
