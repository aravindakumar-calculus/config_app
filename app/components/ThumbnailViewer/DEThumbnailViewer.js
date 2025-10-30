"use client";
import React, { useEffect, useState } from "react";
import { useThumbnailRenderer } from "./useThumbnailRenderer";
import { useStore } from "@/store/useStore";
import * as THREE from "three";
import Image from "next/image";

export default function DEThumbnailViewer({
  visibleParts,
  cameraAngle = "front",
  currentTab,
  gltfScene,
  colorHex,
  isIncompatible = false,
  incompatChecker = null,
  targetDO = null,
  currentSelections = {},
  stitchPreviewColor,
  edgePreviewColor,
  width = 152, // <-- default width
  height = 152, // <-- default height
}) {
  const selectedColor = useStore((s) => s.selectedColor);
  const colorSelected = useStore((s) => s.colorSelected);
  const [imgSrc, setImgSrc] = useState(null);
  const { renderThumbnail, prepareScene } = useThumbnailRenderer();

  // Extract complex dependencies
  const visiblePartsStr = JSON.stringify(visibleParts);
  const currentSelectionsStr = JSON.stringify(currentSelections);

  useEffect(() => {
    if (!gltfScene) return;

    const group = prepareScene({
      baseScene: gltfScene,
      visibleParts,
      colorHex:
        colorHex !== undefined
          ? colorHex
          : colorSelected
          ? selectedColor
          : null,
      isIncompatible,
      incompatChecker,
      targetDO,
      currentSelections,
      stitchPreviewColor,
      edgePreviewColor,
    });

    // Camera: front, side, or back
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    if (cameraAngle === "side") {
      if (currentTab === "Rear" || currentTab === "Straps") {
        camera.position.set(3.7, 0, -4); // right side from the back
      } else {
        camera.position.set(-3.7, 0, 4); // side from the front
      }
    } else if (cameraAngle === "back") {
      camera.position.set(0, 0, -5.25);
    } else {
      camera.position.set(0, 0, 5.25);
    }
    camera.lookAt(0, 0, 0);

    const dpr = window.devicePixelRatio || 1;
    const sizeW = width * dpr;
    const sizeH = height * dpr;

    renderThumbnail({
      scene: group,
      camera,
      width: sizeW,
      height: sizeH,
      format: "image/webp",
    }).then(setImgSrc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gltfScene,
    visiblePartsStr,
    renderThumbnail,
    selectedColor,
    colorSelected,
    prepareScene,
    cameraAngle,
    currentTab,
    colorHex,
    isIncompatible,
    incompatChecker,
    targetDO,
    currentSelectionsStr,
    stitchPreviewColor,
    edgePreviewColor,
    width,
    height,
  ]);

  if (!imgSrc) {
    return <div style={{ width, height }} className="bg-gray-100 rounded" />;
  }

  return (
    <Image
      src={imgSrc}
      alt="thumbnail"
      width={width}
      height={height}
      className="object-contain rounded"
      draggable={false}
      style={{ imageRendering: "auto" }}
    />
  );
}
