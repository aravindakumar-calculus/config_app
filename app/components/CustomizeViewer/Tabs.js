import React from "react";
import { useStore } from "@/store/useStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUndo } from "@fortawesome/free-solid-svg-icons";

export default function DETabs() {
  const config = useStore((s) => s.modelConfig);
  const deTabs = Array.isArray(config.deTabs) ? config.deTabs : [];
  const selectedTab = useStore((s) => s.selectedTab);
  const setSelectedTab = useStore((s) => s.setSelectedTab);
  const activeLayerPresets = useStore((s) => s.activeLayerPresets);
  const resetToBB = useStore((s) => s.resetToBB);
  const setRotationY = useStore((s) => s.setRotationY);
  const colorSelected = useStore((s) => s.colorSelected);

  const allTabs = deTabs;

  const handleReset = () => {
    resetToBB();
    setSelectedTab(deTabs[0]);
    setRotationY(0);
  };

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-3 grid-rows-3 gap-2 mb-2">
        {allTabs.map((tab) => {
          const isSelected = selectedTab === tab;
          const isActive =
            tab === "Color"
              ? !!colorSelected
              : activeLayerPresets[tab] !== undefined;

          // Border color logic
          let borderColor = "border-gray-300";
          if (isSelected) borderColor = "border-blue-600";
          else if (isActive) borderColor = "border-green-500";

          let tabClass = `w-full p-0.5 rounded shadow-sm font-medium transition focus:outline-none border-2 ${borderColor} bg-[#ecebe6] text-black text-sm lg:text-base`;

          return (
            <div key={tab} className="flex flex-col items-center flex-1 w-full">
              <button
                onClick={() => {
                  setSelectedTab(tab);
                }}
                className={`${tabClass} hover:ring-2 hover:ring-offset-1 hover:ring-gray-400 cursor-pointer`}
              >
                {tab}
              </button>
            </div>
          );
        })}
      </div>
      <div>
        <hr className="border-t border-gray-300" />
      </div>
      {/* <div className="flex justify-end">
        <button
          onClick={handleReset}
          className="text-gray-500 hover:text-red-600"
          title="Reset"
        >
          <FontAwesomeIcon icon={faUndo} />
        </button>
      </div> */}
    </div>
  );
}
