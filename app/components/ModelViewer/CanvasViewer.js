"use client";

import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import MainScene from "./MainScene";
import Spinner from "@/app/components/ui/spinner";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

export default function CanvasViewer({ controlsRef }) {
  const [modelLoaded, setModelLoaded] = useState(false);

  // Log when CanvasViewer mounts/unmounts
  useEffect(() => {
    console.log("[MAIN CANVAS] CanvasViewer mounted");
    return () => {
      console.log("[MAIN CANVAS] CanvasViewer unmounted");
    };
  }, []);

  // Log when model is loaded
  useEffect(() => {
    if (modelLoaded) {
      console.log("[MAIN CANVAS] Model loaded");
    }
  }, [modelLoaded]);

  // Get state for product description
  const activeLayerPresets = useStore((s) => s.activeLayerPresets);
  const selectedMaterial = useStore((s) => s.selectedMaterial);
  const productDescription = useStore((s) => s.productDescription);

  // Get config for current model (dynamic)
  const config = useStore((s) => s.modelConfig);
  const optionDescriptions = config?.optionDescriptions || {};

  // Build selected descriptions
  const selectedDescriptions = Object.entries(activeLayerPresets || {}).reduce(
    (acc, [deKey, opt]) => {
      if (opt && optionDescriptions[deKey]?.[opt]) {
        acc[deKey] = optionDescriptions[deKey][opt];
      }
      return acc;
    },
    {}
  );
  selectedDescriptions.Color =
    optionDescriptions.Color?.[selectedMaterial] || productDescription;

  return (
    <div className="w-full h-full relative bg-white">
      {/* Product Description section at the top */}
      {/* <div className="w-full text-center py-4 mt-2 border-gray-200 absolute top-0 left-0 z-20">
        <p className="text-sm font-medium text-gray-600">
          {[
            "This is a classic handbag designed for versatility and elegance",
            selectedDescriptions.DE1,
            selectedDescriptions.DE2,
            selectedDescriptions.DE3,
            selectedDescriptions.Color,
          ]
            .filter(Boolean)
            .join(", ")}
        </p>
      </div> */}
      {/* Adjust Canvas container to leave space for the description bar */}
      <div className="w-full h-full pt-14">
        {!modelLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/85">
            <Spinner text="Loading model..." size={32} />
          </div>
        )}
        <Canvas
          shadows
          camera={{ position: [0, 0, 5], fov: 45 }}
          frameloop="demand"
          dpr={1}
          style={{ width: "100%", height: "100%" }}
          gl={{
            preserveDrawingBuffer: false,
            outputColorSpace: THREE.SRGBColorSpace,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: selectedMaterial ? 1.4 : 1.0,
          }}
        >
          {/* Lighting BEFORE color selection */}
          {!selectedMaterial && (
            <>
              <ambientLight intensity={0.6} />
              {/* Front */}
              <directionalLight position={[0, 4, 5]} intensity={0.9} />
              {/* Back */}
              <directionalLight position={[0, 4, -5]} intensity={0.9} />
              {/* Left */}
              <directionalLight position={[-5, 4, 0]} intensity={0.4} />
              {/* Right */}
              <directionalLight position={[5, 4, 0]} intensity={0.4} />
              {/* Bottom */}
              <directionalLight position={[0, -5, 0]} intensity={0.8} />
            </>
          )}

          {/* Lighting AFTER color selection */}
          {selectedMaterial && (
            <>
              <ambientLight intensity={0.6} />
              <directionalLight position={[0, 4, 5]} intensity={1.4} />
              {/* Back */}
              <directionalLight position={[0, 4, -5]} intensity={1.4} />
              {/* Left */}
              <directionalLight position={[-5, 4, 0]} intensity={1.0} />
              {/* Right */}
              <directionalLight position={[5, 4, 0]} intensity={1.0} />
              {/* Bottom */}
              <directionalLight position={[0, -5, 0]} intensity={0.8} />
              {/* Add targeted light for inside front */}
              <spotLight
                position={[0, 2, 3]}
                angle={0.5}
                penumbra={0.7}
                intensity={0.7}
                castShadow
                target-position={[0, 0, 0]}
              />
            </>
          )}

          <MainScene onLoaded={() => setModelLoaded(true)} />
          <OrbitControls
            ref={controlsRef}
            enableRotate={true}
            enablePan={false}
            enableZoom={true}
          />
        </Canvas>
      </div>
    </div>
  );
}
