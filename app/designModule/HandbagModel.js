"use client";

import React, { useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import useClonedScene from "./useClonedScene";
import SyncSceneFrame from "./syncSceneFrame";

export default function HandbagModel({ onLoaded }) {
  const gltfScene = useStore((s) => s.gltfScene);
  const rotationY = useStore((s) => s.rotationY);
  const visibleParts = useStore((s) => s.visibleParts);
  const selectedMaterial = useStore((s) => s.selectedMaterial);
  const setMeshNames = useStore((s) => s.setMeshNames);

  const groupRef = useRef();
  const { clone, originalMats } = useClonedScene(gltfScene, setMeshNames);

  const isVisiblePartsReady =
    visibleParts && Object.values(visibleParts).some(Boolean);

  SyncSceneFrame({
    clone,
    originalMats,
    visibleParts,
    selectedMaterial,
    groupRef,
    rotationY,
  });

  // if (clone) {
  //   console.log("Handbag loaded and UV/material initialized");
  // }

  const isReady = clone && isVisiblePartsReady;

  useEffect(() => {
    if (isReady && onLoaded) {
      onLoaded();
    }
  }, [isReady, onLoaded]);

  if (!isReady) return null;

  return (
    <group ref={groupRef} scale={5} position={[0, -1.25, 0]}>
      <primitive object={clone} />
    </group>
  );
}
