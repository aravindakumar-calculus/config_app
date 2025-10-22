"use client";

import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei"; // <-- Import Environment
import MainScene from "./MainScene";
import Spinner from "@/app/components/ui/spinner";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

export default function CanvasViewer({ controlsRef }) {
  const [modelLoaded, setModelLoaded] = useState(false);

  // useEffect(() => {
  //   console.log("[MAIN CANVAS] CanvasViewer mounted");
  //   return () => {
  //     console.log("[MAIN CANVAS] CanvasViewer unmounted");
  //   };
  // }, []);

  useEffect(() => {
    if (modelLoaded) {
      console.log("[MAIN CANVAS] Model loaded");
    }
  }, [modelLoaded]);

  const activeLayerPresets = useStore((s) => s.activeLayerPresets);
  const selectedMaterial = useStore((s) => s.selectedMaterial);
  const productDescription = useStore((s) => s.productDescription);
  const config = useStore((s) => s.modelConfig);
  const optionDescriptions = config?.optionDescriptions || {};

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
            toneMappingExposure: 0.6,
          }}
        >
          {/* HDRI Environment Lighting */}
          <Environment
            preset="warehouse" // Try "city", "sunset", "warehouse" for different looks
            background={false}
            intensity={0.02}
          />
          {/* Front */}
          <directionalLight position={[0, 0, 5]} intensity={0.7} />
          {/* Back */}
          <directionalLight position={[0, 4, -5]} intensity={0.6} />
          <directionalLight position={[0, 0, -5]} intensity={0.6} />
          {/* <directionalLight position={[-1, 0, -5]} intensity={0.6} />
          <directionalLight position={[-1.5, -1, -5]} intensity={0.4} />
          <directionalLight position={[1.5, 0, -5]} intensity={0.4} /> */}
          {/* RectAreaLight for back */}
          <rectAreaLight
            position={[0, 5, -5]}
            intensity={1.2}
            width={16}
            height={16}
            color={"white"}
            rotation={[0, Math.PI, 0]}
            castShadow={false}
          />

          {/* Left */}
          <directionalLight position={[-5, 4, 0]} intensity={1.0} />
          {/* Right */}
          <directionalLight position={[5, 4, 0]} intensity={1.0} />
          {/* Bottom */}
          <directionalLight position={[0, -5, 0]} intensity={0.4} />
          <directionalLight position={[-1, -5, 0]} intensity={0.3} />
          <directionalLight position={[1, -5, 0]} intensity={0.3} />
          <rectAreaLight
            position={[0, -5, 0]}
            intensity={1.5}
            width={16}
            height={16}
            color={"white"}
            rotation={[Math.PI / 2, 0, 0]} // Faces upward
            castShadow={false}
          />
          {/* Optional: subtle ambient boost */}
          <ambientLight intensity={0.2} />
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
