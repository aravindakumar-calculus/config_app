"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useThumbnailRenderer } from "../ThumbnailViewer/useThumbnailRenderer";
import DEThumbnailViewer from "../ThumbnailViewer/DEThumbnailViewer";
import * as THREE from "three";
import Image from "next/image";

const PALETTE_COLORS = (selfColor) => [
  { key: "self", label: "Self", color: selfColor },
  { key: "white", label: "White", color: "#ffffff" },
  { key: "black", label: "Black", color: "#000000" },
];

export default function ColorTabSection() {
  const selectedMaterial = useStore((s) => s.selectedMaterial);
  const setSelectedMaterial = useStore((s) => s.setSelectedMaterial);
  const setProductDescription = useStore((s) => s.setProductDescription);
  const setSelectedColor = useStore((s) => s.setSelectedColor);
  const setColorSelected = useStore((s) => s.setColorSelected);

  // Use global store for stitch/edgepaint color
  const selectedStitchColor = useStore((s) => s.selectedStitchColor);
  const setSelectedStitchColor = useStore((s) => s.setSelectedStitchColor);
  const selectedEdgepaintColor = useStore((s) => s.selectedEdgepaintColor);
  const setSelectedEdgepaintColor = useStore(
    (s) => s.setSelectedEdgepaintColor
  );

  const config = useStore((s) => s.modelConfig);
  const gltfScene = useStore((s) => s.gltfScene);
  const colorOptions = Object.keys(config.optionDescriptions.Color);
  const { renderThumbnail, prepareScene } = useThumbnailRenderer();
  const visibleParts = useStore((s) => s.visibleParts);

  const [thumbnails, setThumbnails] = useState({});
  const [hoveredColor, setHoveredColor] = useState(null);

  useEffect(() => {
    if (!gltfScene) return;

    colorOptions.forEach((colorKey) => {
      const colorHex = config.colorHex?.[colorKey] || "#ffffff";
      if (thumbnails[colorKey]) return;

      const group = prepareScene({
        baseScene: gltfScene,
        visibleParts,
        colorHex,
      });

      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);

      renderThumbnail({ scene: group, camera }).then((imgSrc) => {
        setThumbnails((prev) => ({ ...prev, [colorKey]: imgSrc }));
      });
    });
    // eslint-disable-next-line
  }, [gltfScene, colorOptions, config.colorHex, visibleParts]);

  // Get the currently selected base color hex
  const selectedColorHex = config.colorHex?.[selectedMaterial] || "#ffffff";

  // For stitch/edgepaint, show all active layers
  const allActiveVisibleParts = Object.fromEntries(
    Object.entries(visibleParts).map(([name, val]) => [name, !!val])
  );

  return (
    <div style={{ minHeight: 120 }}>
      {/* Main Color Palette */}
      <div className="grid grid-cols-2 p-2">
        {colorOptions.map((colorKey) => {
          const colorHex = config.colorHex?.[colorKey] || "#ffffff";
          const description =
            config.optionDescriptions.Color[colorKey] || colorKey;
          const imgSrc = thumbnails[colorKey];

          return (
            <div
              key={colorKey}
              className="relative group flex flex-col items-center py-2"
            >
              <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap">
                {description}
              </div>
              <div
                className={`w-38 h-38 rounded-full overflow-hidden border-2 transition-all flex items-center justify-center
                ${
                  selectedMaterial === colorKey
                    ? "ring ring-blue-500 border-blue-500"
                    : "border-gray-300"
                }
                cursor-pointer`}
                onClick={() => {
                  setSelectedMaterial(colorKey);
                  setProductDescription(description);
                  setSelectedColor(colorHex);
                  setColorSelected(true);
                }}
                onMouseEnter={() => setHoveredColor(colorKey)}
                onMouseLeave={() => setHoveredColor(null)}
                tabIndex={0}
              >
                {hoveredColor === colorKey && gltfScene ? (
                  <DEThumbnailViewer
                    visibleParts={visibleParts}
                    cameraAngle="side"
                    currentTab="Color"
                    gltfScene={gltfScene}
                    colorHex={colorHex}
                  />
                ) : imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={description}
                    width={80}
                    height={112}
                    className="w-38 h-38 rounded-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div
                    style={{
                      background: colorHex,
                      width: 80,
                      height: 112,
                      borderRadius: "50%",
                      border: "1px solid #ccc",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stitch Color Palette */}
      <div className="mt-4">
        <div className="font-semibold mb-2 text-sm">Stitch Color</div>
        <div className="grid grid-cols-2 gap-4">
          {PALETTE_COLORS(selectedColorHex).map((opt) => (
            <button
              key={opt.key}
              className={`w-38 h-38 rounded-full border-2 flex items-center justify-center ${
                selectedStitchColor === opt.key
                  ? "border-blue-500 ring ring-blue-400"
                  : "border-gray-300"
              }`}
              onClick={() => setSelectedStitchColor(opt.key)}
              title={opt.label}
            >
              <DEThumbnailViewer
                visibleParts={allActiveVisibleParts}
                cameraAngle="front"
                currentTab="Color"
                gltfScene={gltfScene}
                colorHex={selectedColorHex}
                stitchPreviewColor={opt.key}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Edgepaint Color Palette */}
      <div className="mt-4">
        <div className="font-semibold mb-2 text-sm">Edgepaint Color</div>
        <div className="grid grid-cols-2 gap-4">
          {PALETTE_COLORS(selectedColorHex).map((opt) => (
            <button
              key={opt.key}
              className={`w-38 h-38 rounded-full border-2 flex items-center justify-center ${
                selectedEdgepaintColor === opt.key
                  ? "border-blue-500 ring ring-blue-400"
                  : "border-gray-300"
              }`}
              onClick={() => setSelectedEdgepaintColor(opt.key)}
              title={opt.label}
            >
              <DEThumbnailViewer
                visibleParts={allActiveVisibleParts}
                cameraAngle="front"
                currentTab="Color"
                gltfScene={gltfScene}
                colorHex={selectedColorHex}
                edgePreviewColor={opt.key}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
