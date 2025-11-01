"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import DETabs from "./Tabs";
import ColorTabSection from "./ColorTabSection";
import DETabContent from "./DETabSection";
import Spinner from "@/app/components/ui/spinner";
import StyleTabSection from "./StyleTabSection";
import { useIncompatibilityChecker } from "./IncompatibilityChecker";

export default function CustomizeViewer() {
  const meshNames = useStore((s) => s.meshNames);
  const visibleParts = useStore((s) => s.visibleParts);
  const setVisibleParts = useStore((s) => s.setVisibleParts);
  const selectedTab = useStore((s) => s.selectedTab);
  const setActiveLayerPreset = useStore((s) => s.setActiveLayerPreset);
  const computeCombinedVisibility = useStore(
    (s) => s.computeCombinedVisibility
  );
  const activeLayerPresets = useStore((s) => s.activeLayerPresets);
  const setSelectedTab = useStore((s) => s.setSelectedTab);

  // Get config for current model
  const config = useStore((s) => s.modelConfig);
  const deTabs = config.deTabs;
  const deOptions = config.deOptions;

  // Incompatibility checker hook
  const incompatChecker = useIncompatibilityChecker();

  // Initialize with first tab
  useEffect(() => {
    const firstTab = deTabs?.[0];
    if (firstTab) {
      setSelectedTab(firstTab);
    }
  }, [deTabs, setSelectedTab]);

  // Scroll-to-top logic for tab content
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [selectedTab]);

  // Enhanced: Auto-resolve incompatibilities on selection
  const handleDEClick = useCallback(
    (opt) => {
      if (incompatChecker) {
        let updatedPresets = { ...activeLayerPresets, [selectedTab]: opt };
        let resetTabs = [];
        for (const [cat, doName] of Object.entries(updatedPresets)) {
          if (cat === selectedTab) continue;
          if (
            doName &&
            (incompatChecker.areIncompatible(opt, doName) ||
              incompatChecker.areIncompatible(doName, opt))
          ) {
            updatedPresets[cat] = null;
            resetTabs.push(cat); // Track which tabs were reset
          }
        }
        Object.entries(updatedPresets).forEach(([cat, val]) =>
          setActiveLayerPreset(cat, val)
        );
        // If any tab was reset, set the first one as active
        // if (resetTabs.length > 0) {
        //   setSelectedTab(resetTabs[0]);
        // }
      } else {
        setActiveLayerPreset(selectedTab, opt);
      }
      // Update visible parts
      const merged = computeCombinedVisibility();
      setVisibleParts(merged);
    },
    [
      selectedTab,
      setActiveLayerPreset,
      computeCombinedVisibility,
      setVisibleParts,
      activeLayerPresets,
      incompatChecker,
    ]
  );

  // Defensive: Only render when meshNames and visibleParts are ready
  if (
    !meshNames ||
    meshNames.length === 0 ||
    !visibleParts ||
    Object.keys(visibleParts).length === 0
  ) {
    return (
      <aside className="w-[20%] h-full p-4 bg-white border-l overflow-hidden flex flex-col">
        <div className="flex flex-1 items-center justify-center">
          <Spinner text="Loading options..." size={32} />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[28%] h-[80%] p-4 bg-white border border-gray-300 rounded-lg shadow-sm flex flex-col">
      <DETabs />
      <div
        ref={scrollRef}
        className="flex flex-col justify-between grow overflow-y-auto"
      >
        <div className="flex flex-col gap-4">
          {selectedTab === "Style" ? (
            <StyleTabSection />
          ) : selectedTab === "Color" ? (
            <ColorTabSection />
          ) : (
            selectedTab &&
            deOptions[selectedTab] && (
              <DETabContent
                key={selectedTab}
                selectedTab={selectedTab}
                deOptions={deOptions}
                activeLayerPresets={activeLayerPresets}
                handleDEClick={handleDEClick}
              />
            )
          )}
        </div>
      </div>
    </aside>
  );
}
