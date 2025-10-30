import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export default function UseClonedScene(sharedScene, setMeshNames) {
  const originalMats = useRef({});
  const config = useStore((s) => s.modelConfig);

  const { clone, uniqueNames } = useMemo(() => {
    if (!sharedScene) return { clone: null, uniqueNames: [] };

    // Deep clone (copies geometry & materials)
    const cloned = sharedScene.clone(true);
    const rawNames = [];

    cloned.traverse((node) => {
      if (!node.isMesh || !node.material) return;

      // Collect mesh names
      rawNames.push(node.name);

      // Backup original material and color (only once)
      if (!node.userData._originalMaterial) {
        node.userData._originalMaterial = node.material.clone();
      }
      if (node.material.color && !node.userData._originalColor) {
        node.userData._originalColor = node.material.color.clone();
      }

      // Fix texture colorSpaces
      if (node.material.map) {
        node.material.map.colorSpace = THREE.SRGBColorSpace;
      }
      if (node.material.emissiveMap) {
        node.material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
      }
      if (node.material.normalMap) {
        node.material.normalMap.colorSpace = THREE.NoColorSpace;
      }
      if (node.material.roughnessMap) {
        node.material.roughnessMap.colorSpace = THREE.NoColorSpace;
      }
      if (node.material.metalnessMap) {
        node.material.metalnessMap.colorSpace = THREE.NoColorSpace;
      }
      if (node.material.aoMap) {
        node.material.aoMap.colorSpace = THREE.NoColorSpace;
      }
      if (node.material.displacementMap) {
        node.material.displacementMap.colorSpace = THREE.NoColorSpace;
      }

      node.material.needsUpdate = true;

      // Enable shadows
      node.castShadow = true;
      node.receiveShadow = true;
    });

    // Use mesh names directly, deduplicated
    const uniqueNames = Array.from(new Set(rawNames));
    //console.log("[LAYERS] Mesh names for selected model:", uniqueNames);

    return { clone: cloned, uniqueNames };
  }, [sharedScene]);

  // Set mesh names after clone is created (side effect)
  useEffect(() => {
    if (uniqueNames && uniqueNames.length > 0) {
      setMeshNames(uniqueNames);
    }
  }, [uniqueNames, setMeshNames]);

  return { clone, originalMats };
}
