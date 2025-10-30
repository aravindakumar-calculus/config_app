"use client";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import ConfigLayout from "./ConfigLayout";
import MainLayout from "../main_layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { preloadGLBsInOrder } from "@/app/utils/glbCache";

const ModelLoader = dynamic(
  () => import("@/app/components/ModelLoader/ModelLoader"),
  { ssr: false }
);

export default function Page() {
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const controlsRef = useRef();
  const setSelectedModel = useStore((s) => s.setSelectedModel);
  const router = useRouter();
  const [allModels, setAllModels] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
    if (!useStore.getState().gltfScene) {
      setSelectedModel();
    }
  }, [isLoggedIn, setSelectedModel, router]);

  useEffect(() => {
    fetch("/api/model")
      .then((res) => res.json())
      .then(setAllModels);
  }, []);

  // Extract complex dependency for useEffect
  const modelConfig = useStore.getState().modelConfig;
  const modelUrl = modelConfig?.modelUrl;

  useEffect(() => {
    if (allModels.length > 0 && modelUrl) {
      const defaultUrl = modelUrl;
      const preloadUrls = allModels
        .map((model) => model.modelUrl)
        .filter((url) => url !== defaultUrl);

      if (preloadUrls.length > 0) {
        // console.log(
        //   "[GLB] Throttled lazy loading models (in order):",
        //   preloadUrls
        // );
        preloadGLBsInOrder(
          preloadUrls,
          "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
        );
      }
    }
  }, [allModels, modelUrl]);

  return (
    <div className="relative min-h-screen">
      <MainLayout />
      <ModelLoader>
        <ConfigLayout controlsRef={controlsRef} />
      </ModelLoader>
    </div>
  );
}
