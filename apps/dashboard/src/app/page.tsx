"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiKey } from "@/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const key = getApiKey();
    if (key) {
      router.replace("/app");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}
