"use client";
import { useEffect, useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import DEThumbnailViewer from "../ThumbnailViewer/DEThumbnailViewer";
import { loadGLB } from "@/app/utils/glbCache";

export default function StyleTabSection() {
  const [models, setModels] = useState([]);
  const [modelConfigs, setModelConfigs] = useState({});
  const [modelMeshNames, setModelMeshNames] = useState({});
  const [scenes, setScenes] = useState({});
  const [hoveredModel, setHoveredModel] = useState(null);
  const selectedModel = useStore((s) => s.selectedModel);
  const setSelectedModel = useStore((s) => s.setSelectedModel);
  const switchingRef = useRef(false);

  // Step 1: Fetch all model names and URLs
  useEffect(() => {
    fetch("/api/model")
      .then((res) => res.json())
      .then(setModels);
  }, []);

  // Step 2: For each model, fetch its full config and load its scene
  useEffect(() => {
    models.forEach((model) => {
      // Fetch config if not already loaded
      if (!modelConfigs[model.name]) {
        fetch(`/api/config?name=${encodeURIComponent(model.name)}`)
          .then((res) => res.json())
          .then((cfg) => {
            setModelConfigs((prev) => ({ ...prev, [model.name]: cfg }));
            // Extract mesh names for this model (from all style layers)
            const stylePresets = cfg.layerPresets?.Style || {};
            const allMeshNames = Array.from(
              new Set(Object.values(stylePresets).flat())
            );
            setModelMeshNames((prev) => ({
              ...prev,
              [model.name]: allMeshNames,
            }));
          });
      }
      // Load scene if not already loaded
      if (!scenes[model.name]) {
        loadGLB(
          model.modelUrl,
          "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
        ).then((scene) => {
          setScenes((prev) => ({ ...prev, [model.name]: scene }));
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models]);

  const handleStyleClick = (modelName) => {
    if (switchingRef.current) return;
    switchingRef.current = true;
    setSelectedModel(modelName).finally(() =>
      setTimeout(() => {
        switchingRef.current = false;
      }, 500)
    );
  };

  return (
    <div className="grid grid-cols-2 p-2">
      {models.map((model) => {
        const config = modelConfigs[model.name];
        const scene = scenes[model.name];
        const meshNamesForModel = modelMeshNames[model.name] || [];
        let visiblePartsMap = {};
        if (config && meshNamesForModel.length) {
          const styleKey = config.deOptions?.Style?.[0];
          const styleLayers = config.layerPresets?.Style?.[styleKey] || [];
          const visibleSet = new Set(styleLayers);
          visiblePartsMap = Object.fromEntries(
            meshNamesForModel.map((name) => [name, visibleSet.has(name)])
          );
        }
        return (
          <div
            key={model.name}
            className="relative group flex flex-col items-center py-2"
          >
            {/* Tooltip */}
            <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap">
              {model.name}
            </div>
            <button
              className={`w-38 h-38 rounded-full overflow-hidden border-2 transition-all flex items-center justify-center
                ${
                  selectedModel === model.name
                    ? "ring ring-blue-500 border-blue-500"
                    : "border-gray-300"
                }
                cursor-pointer`}
              onClick={() => handleStyleClick(model.name)}
              onMouseEnter={() => setHoveredModel(model.name)}
              onMouseLeave={() => setHoveredModel(null)}
              tabIndex={0}
              style={{
                margin: 0,
                padding: 0,
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                {scene && Object.keys(visiblePartsMap).length > 0 ? (
                  <DEThumbnailViewer
                    visibleParts={visiblePartsMap}
                    cameraAngle={hoveredModel === model.name ? "side" : "front"}
                    currentTab="Style"
                    gltfScene={scene}
                  />
                ) : (
                  <div className="w-38 h-38 bg-gray-100 rounded-full" />
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
