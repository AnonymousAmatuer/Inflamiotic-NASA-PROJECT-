"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";

export default function SplashScreen({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [removeSplash, setRemoveSplash] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setShowSplash(false), 2300);
    const removeTimer = window.setTimeout(() => setRemoveSplash(true), 2800);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden={showSplash}
        className={`transition-opacity duration-500 ease-out ${showSplash ? "opacity-0" : "opacity-100"}`}
      >
        {children}
      </div>

      {!removeSplash && (
        <div
          role="status"
          aria-label="Loading Inflamiotic"
          className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#0b0910] px-6 transition-opacity duration-500 ease-out ${showSplash ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_24%_35%,rgba(190,113,70,0.18),transparent_43%),radial-gradient(ellipse_at_82%_70%,rgba(131,73,126,0.16),transparent_48%)]" />
          <div className="relative flex w-full max-w-xl flex-col items-center text-center">
            <Image
              src="/brand/inflamiotic-logo.jpeg"
              alt=""
              width={1408}
              height={768}
              priority
              className="h-auto w-full mix-blend-screen"
            />
            <h1 className="-mt-1 font-serif text-3xl font-semibold tracking-[0.2em] text-[#f2ede5] sm:text-4xl">
              INFLAMIOTIC
            </h1>
            <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-slate-400">Making space safer</p>
            <div aria-hidden="true" className="mt-8 h-px w-40 overflow-hidden bg-slate-800">
              <div className="splash-progress h-full w-1/2 bg-gradient-to-r from-sky-300 via-orange-300 to-amber-100" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
