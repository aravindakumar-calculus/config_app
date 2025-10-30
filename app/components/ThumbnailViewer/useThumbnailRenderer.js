import { useCallback, useRef, useEffect } from "react";
import * as THREE from "three";
import { getThumbnailRenderer } from "./getThumbnailRenderer";
import { useStore } from "@/store/useStore";

/**
 * Helper to determine if a mesh node should be hidden in an incompatible thumbnail.
 * @param {string} nodeName
 * @param {object} params - { isIncompatible, incompatChecker, targetDO, currentSelections }
 */
function shouldHideInIncompatibleThumbnail(nodeName, params) {
  const { isIncompatible, incompatChecker, targetDO, currentSelections } =
    params;
  if (!isIncompatible || !incompatChecker) return false;
  // Hide mesh if it belongs to a DO that is incompatible with the targetDO
  for (const cat in currentSelections) {
    const selectedDO = currentSelections[cat];
    if (selectedDO && incompatChecker.areIncompatible(selectedDO, targetDO)) {
      // Hide mesh if nodeName contains the incompatible DO's identifier
      // This assumes mesh names contain DO names or unique prefixes
      if (nodeName.includes(selectedDO)) {
        return true;
      }
    }
  }
  return false;
}

let thumbnailQueue = Promise.resolve();

export function useThumbnailRenderer() {
  const materialsToDisposeRef = useRef([]);
  const sceneCloneRef = useRef();

  useEffect(() => {
    return () => {
      materialsToDisposeRef.current.forEach((material) => {
        if (material.dispose) material.dispose();
      });
      materialsToDisposeRef.current = [];
      if (sceneCloneRef.current) {
        sceneCloneRef.current.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose && m.dispose());
            } else {
              child.material.dispose && child.material.dispose();
            }
          }
        });
        sceneCloneRef.current = null;
      }
    };
  }, []);

  /**
   * Prepare the scene for thumbnail rendering, with support for hiding incompatible mesh parts.
   * @param {object} params - { baseScene, visibleParts, colorHex, isIncompatible, incompatChecker, targetDO, currentSelections }
   */
  const prepareScene = useCallback(
    ({
      baseScene,
      visibleParts,
      colorHex,
      stitchPreviewColor,
      edgePreviewColor,
      isIncompatible,
      incompatChecker,
      targetDO,
      currentSelections,
    }) => {
      if (sceneCloneRef.current) {
        sceneCloneRef.current.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose && m.dispose());
            } else {
              child.material.dispose && child.material.dispose();
            }
          }
        });
        sceneCloneRef.current = null;
      }

      const selectedStitchColor = useStore.getState().selectedStitchColor;
      const selectedEdgepaintColor = useStore.getState().selectedEdgepaintColor;

      sceneCloneRef.current = baseScene.clone(true);
      const clone = sceneCloneRef.current;

      clone.traverse((node) => {
        if (!node.isMesh) return;
        let visible = visibleParts?.[node.name] === true;

        // Hide mesh if this is an incompatible thumbnail and this mesh is part of an incompatible DO
        if (
          shouldHideInIncompatibleThumbnail(node.name, {
            isIncompatible,
            incompatChecker,
            targetDO,
            currentSelections,
          })
        ) {
          visible = false;
        }

        node.visible = visible;
        const newMat = node.material.clone();
        materialsToDisposeRef.current.push(newMat);
        node.material = newMat;

        // Set main color for all meshes
        if (colorHex) {
          node.material = node.material.clone();
          node.material.color.set(colorHex);
          node.material.needsUpdate = true;
        }

        // Override stitch color for _S meshes if preview color is set
        if (node.name.endsWith("_S")) {
          let color;
          const stitchColor = stitchPreviewColor || selectedStitchColor;
          if (stitchColor === "self") color = colorHex;
          else if (stitchColor === "white") color = "#ffffff";
          else if (stitchColor === "black") color = "#000000";
          node.material.color.set(color);
          node.material.needsUpdate = true;
        }

        // Edgepaint (_E)
        if (node.name.endsWith("_E")) {
          let color;
          const edgeColor = edgePreviewColor || selectedEdgepaintColor;
          if (edgeColor === "self") color = colorHex;
          //else if (edgeColor === "white") color = "#ffffff";
          else if (edgeColor === "black") color = "#000000";
          node.material.color.set(color);
          node.material.needsUpdate = true;
        }
      });

      // Add lights (if not already present)
      if (!clone.getObjectByName("thumbAmbient")) {
        const ambient = new THREE.AmbientLight(0xffffff, 1.2);
        ambient.name = "thumbAmbient";
        clone.add(ambient);
      }
      if (!clone.getObjectByName("thumbDirFront")) {
        const dir = new THREE.DirectionalLight(0xffffff, 0.5);
        dir.position.set(0, 4, 5);
        dir.name = "thumbDirFront";
        clone.add(dir);
      }
      if (!clone.getObjectByName("thumbDirFront1")) {
        const dir = new THREE.DirectionalLight(0xffffff, 0.5);
        dir.position.set(0, 0, 5);
        dir.name = "thumbDirFront";
        clone.add(dir);
      }
      if (!clone.getObjectByName("thumbDirBack")) {
        const dir = new THREE.DirectionalLight(0xffffff, 1.4);
        dir.position.set(0, 4, -5);
        dir.name = "thumbDirBack";
        clone.add(dir);
      }
      if (!clone.getObjectByName("thumbDirLeft")) {
        const dir = new THREE.DirectionalLight(0xffffff, 1.0);
        dir.position.set(-5, 4, 0);
        dir.name = "thumbDirLeft";
        clone.add(dir);
      }
      if (!clone.getObjectByName("thumbDirRight")) {
        const dir = new THREE.DirectionalLight(0xffffff, 1.0);
        dir.position.set(5, 4, 0);
        dir.name = "thumbDirRight";
        clone.add(dir);
      }
      if (!clone.getObjectByName("thumbDirBottom")) {
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(0, -5, 0);
        dir.name = "thumbDirBottom";
        clone.add(dir);
      }

      const group = new THREE.Group();
      group.scale.set(5, 5, 5);
      group.position.set(0, -1.22, 0);
      group.add(clone);

      return group;
    },
    []
  );

  const renderThumbnail = useCallback(
    async ({
      scene,
      camera,
      width = 152,
      height = 152,
      format = "image/webp",
      quality,
    }) => {
      thumbnailQueue = thumbnailQueue.then(async () => {
        const renderer = getThumbnailRenderer(width, height);
        renderer.setRenderTarget(null);
        renderer.setSize(width, height);
        renderer.render(scene, camera);
        return renderer.domElement.toDataURL(format, quality);
      });
      return thumbnailQueue;
    },
    []
  );

  return { renderThumbnail, prepareScene };
}
