"use client";

import React, { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { getLoadedScene } from "@/app/utils/glbCache";

export default function ModelLoader({ children }) {
  const setGltfScene = useStore((s) => s.setGltfScene);
  const gltfScene = useStore((s) => s.gltfScene);
  const selectedModel = useStore((s) => s.selectedModel);
  const modelConfig = useStore((s) => s.modelConfig);

  const modelUrl = modelConfig?.modelUrl || "/models/MED_TRP_1.glb";
  const cachedScene = getLoadedScene(modelUrl);

  useEffect(() => {
    // Only set gltfScene if cachedScene is available and not already set
    if (
      cachedScene &&
      cachedScene.children?.length > 0 &&
      gltfScene !== cachedScene
    ) {
      setGltfScene(cachedScene);
    }
    // Do NOT set gltfScene to null unless you are unloading
  }, [cachedScene, setGltfScene, selectedModel, gltfScene]);

  return <>{children}</>;
}
