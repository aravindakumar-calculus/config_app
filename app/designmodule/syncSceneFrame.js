import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useStore } from "@/store/useStore";

// Helper to get the correct "Self" color for edgepaint/thread
const getSelfDetailColor = (config, selectedMaterial, type) => {
  return (
    config.selfDetailColors?.[selectedMaterial]?.[type] ||
    config.colorHex?.[selectedMaterial] ||
    "#ffffff"
  );
};

export default function SyncSceneFrame({
  clone,
  visibleParts,
  groupRef,
  rotationY,
}) {
  const { invalidate } = useThree();
  const config = useStore((s) => s.modelConfig);
  const selectedMaterial = useStore((s) => s.selectedMaterial);
  const selectedColor = useStore((s) => s.selectedColor);
  const colorSelected = useStore((s) => s.colorSelected);
  const selectedStitchColor = useStore((s) => s.selectedStitchColor);
  const selectedEdgepaintColor = useStore((s) => s.selectedEdgepaintColor);

  // Set mesh visibility
  useEffect(() => {
    if (!clone) return;
    clone.traverse((node) => {
      if (!node.isMesh) return;
      const key = node.name;
      node.visible = visibleParts[key] === true;
    });
    invalidate();
  }, [clone, visibleParts, invalidate]);

  // Apply color/material logic
  useEffect(() => {
    if (!clone) return;
    clone.traverse((node) => {
      if (!node.isMesh) return;
      let mat = node.material;

      // Special parts: restore original logic
      if (node.name.startsWith("ZT-") || node.name.startsWith("HW_")) {
        if (node.userData._originalMaterial) {
          node.material = node.userData._originalMaterial.clone();
          node.material.needsUpdate = true;
        }
        if (node.userData._originalColor) {
          node.material.color.copy(node.userData._originalColor);
        }
      } else if (node.name.endsWith("_S")) {
        // Stitch mesh
        let color;
        if (selectedStitchColor === "self")
          color = getSelfDetailColor(config, selectedMaterial, "thread");
        else if (selectedStitchColor === "white") color = "#ffffff";
        else if (selectedStitchColor === "black") color = "#000000";
        node.material.color.set(color);
        node.material.needsUpdate = true;
      } else if (node.name.endsWith("_E")) {
        // Edgepaint mesh
        let color;
        if (selectedEdgepaintColor === "self")
          color = getSelfDetailColor(config, selectedMaterial, "edgepaint");
        //else if (selectedEdgepaintColor === "white") color = "#ffffff";
        else if (selectedEdgepaintColor === "black") color = "#000000";
        node.material.color.set(color);
        node.material.needsUpdate = true;
      } else {
        if (colorSelected) {
          node.material.color.set(selectedColor);
          node.material.toneMapped = true;
          node.material.needsUpdate = true;
        } else {
          if (
            node.userData._originalMaterial &&
            node.material.type === node.userData._originalMaterial.type
          ) {
            node.material = node.userData._originalMaterial.clone();
          }
          if (node.userData._originalColor) {
            node.material.color.copy(node.userData._originalColor);
          }
        }
      }
    });
    invalidate();
  }, [
    clone,
    selectedColor,
    colorSelected,
    selectedStitchColor,
    selectedEdgepaintColor,
    config,
    selectedMaterial,
    invalidate,
  ]);

  // Apply rotation
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = rotationY ?? 0;
  }, [rotationY, groupRef]);
}
