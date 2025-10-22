import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const glbPromises = {};
const loadedScenes = {};

// function logMemoryUsage(url) {
//   if (performance && performance.memory) {
//     const usedMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
//     const totalMB = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(
//       2
//     );
//     console.log(
//       `[GLB] Memory after loading ${url}: ${usedMB} MB used / ${totalMB} MB total`
//     );
//   } else {
//     console.log(`[GLB] Memory info not available in this browser.`);
//   }
// }

export function loadGLB(url, dracoPath) {
  if (loadedScenes[url]) {
    //console.log(`[GLB] Already loaded: ${url}`);
    return Promise.resolve(loadedScenes[url]);
  }
  if (!glbPromises[url]) {
    glbPromises[url] = new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      if (dracoPath) {
        import("three/examples/jsm/loaders/DRACOLoader").then(
          ({ DRACOLoader }) => {
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath(dracoPath);
            loader.setDRACOLoader(dracoLoader);
            loader.load(
              url,
              (gltf) => {
                loadedScenes[url] = gltf.scene;
                //console.log(`[GLB] Loaded: ${url}`);
                // console.log(
                //   `[GLB] Total loaded: ${Object.keys(loadedScenes).length}`
                // );
                // console.log(
                //   `[GLB] Loaded model URLs:`,
                //   Object.keys(loadedScenes)
                // );
                // logMemoryUsage(url);
                resolve(gltf.scene);
              },
              undefined,
              (err) => reject(err)
            );
          }
        );
      } else {
        loader.load(
          url,
          (gltf) => {
            loadedScenes[url] = gltf.scene;
            //console.log(`[GLB] Loaded: ${url}`);
            // console.log(
            //   `[GLB] Total loaded: ${Object.keys(loadedScenes).length}`
            // );
            //console.log(`[GLB] Loaded model URLs:`, Object.keys(loadedScenes));
            // logMemoryUsage(url);
            resolve(gltf.scene);
          },
          undefined,
          (err) => reject(err)
        );
      }
    });
  }
  return glbPromises[url];
}

export function getLoadedScene(url) {
  return loadedScenes[url] || null;
}

// Throttled, in-order preloading
export async function preloadGLBsInOrder(modelUrls, dracoPath) {
  for (const url of modelUrls) {
    if (!loadedScenes[url]) {
      //console.log(`[GLB] Throttled preload: ${url}`);
      try {
        await loadGLB(url, dracoPath);
      } catch (err) {
        console.error(`[GLB] Failed to preload: ${url}`, err);
      }
    } else {
      //console.log(`[GLB] Already preloaded: ${url}`);
    }
  }
}
