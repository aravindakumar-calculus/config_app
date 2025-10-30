import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export default function InventorySection() {
  const inventoryData = useStore((s) => s.inventoryData);
  const setInventoryData = useStore((s) => s.setInventoryData);
  const modelConfig = useStore((s) => s.modelConfig);
  const activeLayerPresets = useStore((s) => s.activeLayerPresets);
  const visibleParts = useStore((s) => s.visibleParts);
  const selectedStitchColor = useStore((s) => s.selectedStitchColor);
  const selectedEdgepaintColor = useStore((s) => s.selectedEdgepaintColor);

  // Fetch inventory data on mount
  useEffect(() => {
    if (!inventoryData) {
      fetch("/api/inventory_data")
        .then((res) => res.json())
        .then(setInventoryData);
    }
  }, [inventoryData, setInventoryData]);

  // Table 1: Lining and Interfacing
  const styleDOName = activeLayerPresets?.Style || "";
  const modelUrl = modelConfig?.modelUrl || "";
  const sourceFileName = modelUrl.split("/").pop()?.replace(".glb", "") || "";

  return (
    <div className="mt-8">
      <h3 className="font-bold text-lg mb-2">
        Table 1: Lining and Interfacing
      </h3>
      <table className="w-full mb-6 border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Item</th>
            <th className="border px-2 py-1">Inventory Number</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-2 py-1">Bucket Lining</td>
            <td className="border px-2 py-1">{`BL-${styleDOName}`}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1">Interfacing group number</td>
            <td className="border px-2 py-1">{`IF-${sourceFileName}`}</td>
          </tr>
        </tbody>
      </table>

      <h3 className="font-bold text-lg mb-2">
        Table 2: Leather, Edge paint and Hardware
      </h3>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Pattern Name</th>
            <th className="border px-2 py-1">Material S/N</th>
            <th className="border px-2 py-1">Edge paint S/N</th>
            <th className="border px-2 py-1">Thread S/N</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(visibleParts || {})
            .filter(
              ([layerName, isVisible]) =>
                isVisible &&
                !layerName.endsWith("_E") &&
                !layerName.endsWith("_S")
            )
            .map(([layerName]) => {
              const selectedMaterial = useStore.getState().selectedMaterial;
              const config = modelConfig;
              const inv = inventoryData?.find(
                (item) =>
                  item.leatherColor ===
                  config.optionDescriptions?.Color?.[selectedMaterial]
              );

              // Use lowercase for comparison
              const edgePaintChoice = (
                selectedEdgepaintColor || "black"
              ).toLowerCase();
              const threadChoice = (
                selectedStitchColor || "black"
              ).toLowerCase();

              // Determine which edge paint S/N to use
              let edgePaintSN = "";
              if (inv) {
                if (edgePaintChoice === "black") {
                  edgePaintSN = inv.edgePaintBlackSN || "";
                } else {
                  edgePaintSN =
                    config.selfDetailColors?.[selectedMaterial]?.edgepaintSN ||
                    inv.edgePaintSelfSN ||
                    "";
                }
              }

              // Determine which thread S/N to use
              let threadSN = "";
              if (inv) {
                if (threadChoice === "black") {
                  threadSN = inv.threadBlackSN || "";
                } else if (threadChoice === "white") {
                  threadSN = inv.threadWhiteSN || "";
                } else {
                  threadSN =
                    config.selfDetailColors?.[selectedMaterial]?.threadSN ||
                    inv.threadSelfSN ||
                    "";
                }
              }

              return (
                <tr key={layerName}>
                  <td className="border px-2 py-1">{layerName}</td>
                  <td className="border px-2 py-1">{inv?.materialSN || ""}</td>
                  <td className="border px-2 py-1">{edgePaintSN}</td>
                  <td className="border px-2 py-1">{threadSN}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
