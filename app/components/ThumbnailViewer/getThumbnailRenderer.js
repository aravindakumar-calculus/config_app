import * as THREE from "three";

let thumbnailRenderer = null;

export function getThumbnailRenderer(width = 152, height = 152) {
  if (thumbnailRenderer && thumbnailRenderer.getContext().isContextLost()) {
    console.warn("[THUMBNAIL] Context lost, disposing renderer");
    thumbnailRenderer.dispose();
    if (thumbnailRenderer.domElement.parentNode) {
      thumbnailRenderer.domElement.parentNode.removeChild(
        thumbnailRenderer.domElement
      );
    }
    thumbnailRenderer = null;
  }
  if (!thumbnailRenderer) {
    //console.log("[THUMBNAIL] Creating new thumbnail renderer");
    thumbnailRenderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    thumbnailRenderer.setClearColor(0xffffff, 1);
    thumbnailRenderer.domElement.style.position = "absolute";
    thumbnailRenderer.domElement.style.left = "-9999px";
    thumbnailRenderer.domElement.style.top = "-9999px";
    document.body.appendChild(thumbnailRenderer.domElement);

    thumbnailRenderer.domElement.addEventListener(
      "webglcontextlost",
      (event) => {
        event.preventDefault();
        console.warn("[THUMBNAIL] WebGL context lost");
      }
    );
    thumbnailRenderer.domElement.addEventListener(
      "webglcontextrestored",
      () => {
        //console.log("[THUMBNAIL] WebGL context restored");
      }
    );
  }
  thumbnailRenderer.setSize(width, height);
  return thumbnailRenderer;
}

export function disposeThumbnailRenderer() {
  if (thumbnailRenderer) {
    //console.log("[THUMBNAIL] Disposing thumbnail renderer");
    thumbnailRenderer.dispose();
    if (thumbnailRenderer.domElement.parentNode) {
      thumbnailRenderer.domElement.parentNode.removeChild(
        thumbnailRenderer.domElement
      );
    }
    thumbnailRenderer = null;
  }
}
