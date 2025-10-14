"use client";

import React, { useState } from "react";
import DEThumbnailViewer from "../ThumbnailViewer/DEThumbnailViewer";
import { useStore } from "@/store/useStore";
import { useIncompatibilityChecker } from "./IncompatibilityChecker";

export default function DETabContent({
  selectedTab,
  deOptions,
  activeLayerPresets,
  handleDEClick,
}) {
  const config = useStore((s) => s.modelConfig);
  const optionDescriptions = config.optionDescriptions;
  const layerPresets = config.layerPresets;
  const deTabs = config.deTabs || [];
  const meshNames = useStore((s) => s.meshNames);
  const gltfScene = useStore((s) => s.gltfScene);
  const incompatChecker = useIncompatibilityChecker();
  const tabIdx = deTabs.indexOf(selectedTab);
  const [hoveredOpt, setHoveredOpt] = useState(null);

  // These hooks ensure re-render on color/material change
  const selectedColor = useStore((s) => s.selectedColor);
  const selectedStitchColor = useStore((s) => s.selectedStitchColor);
  const selectedEdgepaintColor = useStore((s) => s.selectedEdgepaintColor);

  // Helper to get default DO for a tab/category
  function getDefaultDO(tab) {
    // Try ref_map default if available, else first option
    return (
      config.ref_map?.defaults?.[tab]?.[config.name] ||
      (config.deOptions[tab] && config.deOptions[tab][0]) ||
      null
    );
  }

  if (!deOptions[selectedTab]) return null;

  // Use the engine to sort compatible/incompatible
  let compatible = [],
    incompatible = [];
  if (incompatChecker) {
    const allDOs = deOptions[selectedTab];
    const activePresets = activeLayerPresets;
    const sorted = incompatChecker.sortDOsByCompatibility(
      allDOs,
      selectedTab,
      activePresets
    );
    compatible = sorted.compatible;
    incompatible = sorted.incompatible;
  } else {
    compatible = deOptions[selectedTab];
    incompatible = [];
  }

  const currentSelections = activeLayerPresets;

  function renderOption(opt, isCompatible) {
    // Build combined presets: all previous tabs + this option
    let combinedPresets = {};
    for (let i = 0; i < deTabs.length; i++) {
      const tab = deTabs[i];
      if (i < tabIdx) {
        // For incompatible options, use default DO if this tab's DO is incompatible with the new DO
        if (
          !isCompatible &&
          incompatChecker &&
          activeLayerPresets[tab] &&
          incompatChecker.areIncompatible(opt, activeLayerPresets[tab])
        ) {
          combinedPresets[tab] = getDefaultDO(tab);
        } else {
          combinedPresets[tab] = activeLayerPresets[tab];
        }
      } else if (i === tabIdx) {
        combinedPresets[tab] = opt;
      }
    }

    // Build visibleParts map for the thumbnail
    let visibleSet = new Set();
    for (let i = 0; i <= tabIdx; i++) {
      const tab = deTabs[i];
      const presetOpt = combinedPresets[tab];
      const presetArr = layerPresets[tab]?.[presetOpt] || [];
      presetArr.forEach((name) => visibleSet.add(name));
    }
    const visiblePartsMap = Object.fromEntries(
      meshNames.map((name) => [name, visibleSet.has(name)])
    );

    const isSelected = activeLayerPresets[selectedTab] === opt;
    const description =
      (optionDescriptions && optionDescriptions[selectedTab]?.[opt]) ||
      "Design Options";

    return (
      <div key={opt} className="relative group flex flex-col items-center py-2">
        {/* Tooltip */}
        <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap">
          {description}
        </div>
        <div
          className={
            `w-38 h-38 rounded-full overflow-hidden border-2 transition-all relative ` +
            (isSelected
              ? "ring ring-blue-500 border-blue-500 "
              : "border-gray-300 ") +
            (!isCompatible ? "border-red-400" : "cursor-pointer ")
          }
          onClick={() => handleDEClick(opt)}
          aria-disabled={!isCompatible ? true : undefined}
          //tabIndex={isCompatible ? 0 : -1}
          onMouseEnter={() => setHoveredOpt(opt)}
          onMouseLeave={() => setHoveredOpt(null)}
          draggable={false}
          //style={{ outline: "none" }}
        >
          <DEThumbnailViewer
            visibleParts={visiblePartsMap}
            cameraAngle={
              selectedTab === "Rear" || selectedTab === "Straps"
                ? hoveredOpt === opt
                  ? "side"
                  : "back"
                : hoveredOpt === opt
                ? "side"
                : "front"
            }
            currentTab={selectedTab}
            isIncompatible={!isCompatible}
            incompatChecker={incompatChecker}
            targetDO={opt}
            currentSelections={currentSelections}
            gltfScene={gltfScene}
            colorHex={selectedColor}
            stitchPreviewColor={selectedStitchColor}
            edgePreviewColor={selectedEdgepaintColor}
          />
          {!isCompatible && (
            <span className="absolute top-1 right-1 bg-red-400 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold shadow">
              !
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 p-2">
        {compatible.map((opt) => renderOption(opt, true))}
      </div>
      {incompatible.length > 0 && (
        <div className="mt-4 pt-2 border-t border-red-400">
          <div className="text-sm font-semibold text-red-400 mb-1 ml-2">
            Incompatible Options
          </div>
          <div className="grid grid-cols-2 p-2">
            {incompatible.map((opt) => renderOption(opt, false))}
          </div>
        </div>
      )}
    </div>
  );
}
