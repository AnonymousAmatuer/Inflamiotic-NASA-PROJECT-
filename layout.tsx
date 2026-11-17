import type { Metadata } from "next";
import type { ReactNode } from "react";
import SplashScreen from "@/components/SplashScreen";
import PassingPlanets from "@/components/PassingPlanets";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inflamiotic | Making Space Safer",
  description: "A practical visual guide to NASA combustion research and what its experiments can tell us about fire safety for future crews.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="text-slate-100 antialiased">
        <div className="cosmic-backdrop" aria-hidden="true">
          <span className="starfield starfield-near" />
          <span className="starfield starfield-far" />
          <span className="nebula-cloud nebula-cloud-a" />
          <span className="nebula-cloud nebula-cloud-b" />
          <span className="shooting-star" />
          <PassingPlanets />
        </div>
        <SplashScreen><div className="page-content">{children}</div></SplashScreen>
      </body>
    </html>
  );
}
