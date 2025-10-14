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
    if (gltfScene && gltfScene !== cachedScene) {
      gltfScene.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose && m.dispose());
          } else {
            child.material.dispose && child.material.dispose();
          }
        }
      });
      setGltfScene(null);
    }
    if (
      cachedScene &&
      cachedScene.children?.length > 0 &&
      gltfScene !== cachedScene
    ) {
      setGltfScene(cachedScene);
    }
  }, [cachedScene, setGltfScene, selectedModel, gltfScene]);

  return <>{children}</>;
}
