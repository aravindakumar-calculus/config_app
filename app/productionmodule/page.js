"use client";
import MainLayout from "../main_layout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import ConfigLayout from "./ConfigLayout";

export default function Page() {
  const router = useRouter();
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const setSelectedModel = useStore((s) => s.setSelectedModel);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
    if (!useStore.getState().gltfScene) {
      setSelectedModel();
    }
  }, [isLoggedIn, setSelectedModel, router]);

  return (
    <div className="relative min-h-screen">
      <MainLayout />
      <ConfigLayout />
    </div>
  );
}
