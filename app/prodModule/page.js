"use client";
import MainLayout from "../main_layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export default function Page() {
  const router = useRouter();
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const setSelectedModel = useStore((s) => s.setSelectedModel);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
    // Only load model if not loaded
    if (!useStore.getState().gltfScene) {
      setSelectedModel();
    }
  }, [isLoggedIn, setSelectedModel, router]);

  return (
    <div className="relative min-h-screen">
      <MainLayout />
      <p className="p-2">Welcome to Production Module Page.</p>
    </div>
  );
}
