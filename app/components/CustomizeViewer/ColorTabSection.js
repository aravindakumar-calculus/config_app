"use client";
import { useStore } from "@/store/useStore";

// Helper to get the correct "Self" color for edgepaint/thread
const getSelfDetailColor = (config, selectedMaterial, type) => {
  return (
    config.selfDetailColors?.[selectedMaterial]?.[type] ||
    config.colorHex?.[selectedMaterial] ||
    "#ffffff"
  );
};

const PALETTE_COLORS = (selfColor, includeWhite = true) => {
  const base = [
    { key: "self", label: "Self", color: selfColor },
    { key: "black", label: "Black", color: "#000000" },
  ];
  if (includeWhite) {
    base.splice(1, 0, { key: "white", label: "White", color: "#ffffff" });
  }
  return base;
};

export default function ColorTabSection() {
  const selectedMaterial = useStore((s) => s.selectedMaterial);
  const setSelectedMaterial = useStore((s) => s.setSelectedMaterial);
  const setProductDescription = useStore((s) => s.setProductDescription);
  const setSelectedColor = useStore((s) => s.setSelectedColor);
  const setColorSelected = useStore((s) => s.setColorSelected);

  // Use global store for stitch/edgepaint color
  const selectedStitchColor = useStore((s) => s.selectedStitchColor);
  const setSelectedStitchColor = useStore((s) => s.setSelectedStitchColor);
  const selectedEdgepaintColor = useStore((s) => s.selectedEdgepaintColor);
  const setSelectedEdgepaintColor = useStore(
    (s) => s.setSelectedEdgepaintColor
  );

  const config = useStore((s) => s.modelConfig);
  const colorOptions = Object.keys(config.optionDescriptions.Color);

  // Get the currently selected base color hex
  const selectedColorHex = config.colorHex?.[selectedMaterial] || "#ffffff";
  const selfEdgepaintHex = getSelfDetailColor(
    config,
    selectedMaterial,
    "edgepaint"
  );
  const selfThreadHex = getSelfDetailColor(config, selectedMaterial, "thread");

  return (
    <div style={{ minHeight: 120 }}>
      {/* Main Color Palette */}
      <div className="flex flex-wrap gap-2 p-2 mt-4">
        {colorOptions.map((colorKey) => {
          const colorHex = config.colorHex?.[colorKey] || "#ffffff";
          const description =
            config.optionDescriptions.Color[colorKey] || colorKey;

          return (
            <button
              key={colorKey}
              className={`w-13 h-13 rounded-full border-2 transition-all flex items-center justify-center
                ${
                  selectedMaterial === colorKey
                    ? "ring ring-blue-500 border-blue-500"
                    : "border-gray-300"
                }
                cursor-pointer`}
              style={{
                background: colorHex,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
              onClick={() => {
                setSelectedMaterial(colorKey);
                setProductDescription(description);
                setSelectedColor(colorHex);
                setColorSelected(true);
              }}
              title={description}
            />
          );
        })}
      </div>

      {/* Stitch Color Palette */}
      <div className="mt-4">
        <div className="font-semibold mb-2 text-sm">Stitch Color</div>
        <div className="flex gap-2 p-2">
          {PALETTE_COLORS(selfThreadHex, true).map((opt) => (
            <button
              key={opt.key}
              className={`w-13 h-13 rounded-full border-2 flex items-center justify-center ${
                selectedStitchColor === opt.key
                  ? "border-blue-500 ring ring-blue-400"
                  : "border-gray-300"
              }`}
              style={{
                background: opt.color,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
              onClick={() => setSelectedStitchColor(opt.key)}
              title={opt.label}
            />
          ))}
        </div>
      </div>

      {/* Edgepaint Color Palette */}
      <div className="mt-4">
        <div className="font-semibold mb-2 text-sm">Edgepaint Color</div>
        <div className="flex p-2 gap-2">
          {PALETTE_COLORS(selfEdgepaintHex, false).map((opt) => (
            <button
              key={opt.key}
              className={`w-13 h-13 rounded-full border-2 flex items-center justify-center ${
                selectedEdgepaintColor === opt.key
                  ? "border-blue-500 ring ring-blue-400"
                  : "border-gray-300"
              }`}
              style={{
                background: opt.color,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
              onClick={() => setSelectedEdgepaintColor(opt.key)}
              title={opt.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
