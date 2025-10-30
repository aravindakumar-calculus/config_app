import { useThumbnailRenderer } from "../ThumbnailViewer/useThumbnailRenderer";
import * as THREE from "three";

export function useTechPackSnaps() {
  const { renderThumbnail, prepareScene } = useThumbnailRenderer();

  // 8 required camera angles
  const CAMERA_ANGLES = [
    { name: "Front", position: [0, 0, 5.25] },
    { name: "Back", position: [0, 0, -5.25] },
    { name: "Left", position: [-5.25, 0, 0] },
    { name: "Right", position: [5.25, 0, 0] },
    { name: "Top", position: [0, 5.25, 0], lookAt: [0, 0, 0] },
    { name: "Bottom", position: [0, -5.25, 0], lookAt: [0, 0, 0] },
    { name: "Front 30° Right", position: [3.7, 1.5, 4] },
    { name: "Back 30° Left", position: [-3.7, 1.5, -4] },
  ];

  const size = 1024; // Print quality

  // Accept user colors as arguments
  const generateTechPackSnapshots = async (
    gltfScene,
    visibleParts,
    colorHex,
    stitchPreviewColor,
    edgePreviewColor
  ) => {
    // Detect WebP support (client-side only)
    let supportsWebP = false;
    let format = "image/png";
    let quality = undefined;
    if (typeof window !== "undefined") {
      const canvas = document.createElement("canvas");
      supportsWebP =
        canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
      format = supportsWebP ? "image/webp" : "image/png";
      quality = supportsWebP ? 0.88 : undefined;
    }

    const snapshots = [];
    for (const angle of CAMERA_ANGLES) {
      const group = prepareScene({
        baseScene: gltfScene,
        visibleParts,
        colorHex, // Use user color
        stitchPreviewColor,
        edgePreviewColor,
      });

      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(...angle.position);
      camera.lookAt(
        angle.lookAt
          ? new THREE.Vector3(...angle.lookAt)
          : new THREE.Vector3(0, 0, 0)
      );

      const imageData = await renderThumbnail({
        scene: group,
        camera,
        width: size,
        height: size,
        format,
        quality,
      });

      snapshots.push({
        angle: angle.name,
        imageData,
        format: format.split("/")[1],
      });
    }
    return snapshots;
  };

  return { generateTechPackSnapshots };
}
