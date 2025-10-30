"use client";

import React, { useState } from "react";
import { useStore } from "@/store/useStore";
import dynamic from "next/dynamic";
import Spinner from "../ui/spinner";

// Dynamically import GLTFExporter (only on client)
const GLTFExporter = dynamic(
  () =>
    import("three/examples/jsm/exporters/GLTFExporter").then(
      (mod) => mod.GLTFExporter
    ),
  { ssr: false }
);

import DEThumbnailViewer from "../ThumbnailViewer/DEThumbnailViewer";

export default function ModelDownload() {
  const gltfScene = useStore((s) => s.gltfScene);
  const meshNames = useStore((s) => s.meshNames);
  const visibleParts = useStore((s) => s.visibleParts);
  const [downloading, setDownloading] = useState(false);

  // Helper: filter scene to only visible meshes
  const filterScene = (scene, visibleParts) => {
    if (
      !scene ||
      typeof scene.clone !== "function" ||
      typeof scene.traverse !== "function"
    ) {
      console.warn("Scene is not a valid THREE.Object3D", scene);
      return null;
    }
    const clone = scene.clone(true);
    if (!clone || typeof clone.traverse !== "function") {
      console.warn("Clone is not a valid THREE.Object3D", clone);
      return null;
    }
    // Remove invisible meshes
    const toRemove = [];
    clone.traverse((node) => {
      if (node.isMesh && visibleParts[node.name] !== true) {
        toRemove.push(node);
      }
    });
    toRemove.forEach((node) => {
      if (node.parent) node.parent.remove(node);
    });

    // Apply selected color to all visible meshes
    const selectedColor = useStore.getState().selectedColor;
    const colorSelected = useStore.getState().colorSelected;
    clone.traverse((node) => {
      if (node.isMesh && colorSelected && selectedColor) {
        node.material.color.set(selectedColor);
        node.material.needsUpdate = true;
      }
    });

    return clone;
  };

  // Download handler for .gltf (JSON)
  const handleDownloadGLTF = async () => {
    if (
      !gltfScene ||
      typeof gltfScene.clone !== "function" ||
      typeof gltfScene.traverse !== "function"
    )
      return;
    setDownloading(true);
    const { GLTFExporter } = await import(
      "three/examples/jsm/exporters/GLTFExporter"
    );
    const filtered = filterScene(gltfScene, visibleParts);
    if (!filtered) {
      setDownloading(false);
      return;
    }
    const exporter = new GLTFExporter();
    exporter.parse(
      filtered,
      (result) => {
        // result is a JS object (not ArrayBuffer)
        const json = JSON.stringify(result, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Handbag.gltf";
        a.click();
        URL.revokeObjectURL(url);
        setDownloading(false);
      },
      { binary: false }
    );
  };

  if (
    !gltfScene ||
    typeof gltfScene.clone !== "function" ||
    typeof gltfScene.traverse !== "function"
  ) {
    return (
      <div className="w-[28%] h-[80%] p-4 bg-white border border-gray-300 rounded-lg shadow-sm flex flex-col items-center justify-center">
        <Spinner text="Loading 3D model..." size={24} />
      </div>
    );
  }

  return (
    <div className="w-[28%] h-[80%] p-4 bg-white border border-gray-300 rounded-lg shadow-sm flex flex-col items-center">
      <h2 className="font-bold mb-2">3D Model Snapshot</h2>
      <div className="mb-4">
        <DEThumbnailViewer
          visibleParts={visibleParts}
          cameraAngle="front"
          currentTab="Style"
          gltfScene={gltfScene}
          width={400}
          height={400}
        />
      </div>
      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleDownloadGLTF}
        disabled={
          downloading ||
          !gltfScene ||
          typeof gltfScene.clone !== "function" ||
          typeof gltfScene.traverse !== "function"
        }
      >
        {downloading ? "Downloading..." : "Download 3D Model (.gltf)"}
      </button>
    </div>
  );
}
