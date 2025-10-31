"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useTechPackSnaps } from "./useTechPackSnaps";
import InventorySection from "./InventorySection";
import Image from "next/image";
import jsPDF from "jspdf";

export default function TechPack() {
  const gltfScene = useStore((s) => s.gltfScene);
  const visibleParts = useStore((s) => s.visibleParts);
  const inventoryData = useStore((s) => s.inventoryData);
  const modelConfig = useStore((s) => s.modelConfig);
  const activeLayerPresets = useStore((s) => s.activeLayerPresets);
  const selectedStitchColor = useStore((s) => s.selectedStitchColor);
  const selectedEdgepaintColor = useStore((s) => s.selectedEdgepaintColor);

  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [productionNotes, setProductionNotes] = useState([]);

  const { generateTechPackSnapshots } = useTechPackSnaps();

  // Fetch production notes from MongoDB
  useEffect(() => {
    fetch("/api/prod_notes")
      .then((res) => res.json())
      .then(setProductionNotes);
  }, []);

  useEffect(() => {
    async function generateSnaps() {
      if (!gltfScene || !visibleParts) return;
      setLoading(true);
      const snaps = await generateTechPackSnapshots(gltfScene, visibleParts);
      setSnapshots(snaps);
      setLoading(false);
    }
    generateSnaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltfScene, visibleParts]);

  function addFooter(pdf, pageNumber, pageWidth, pageHeight, margin) {
    pdf.setFontSize(10);
    pdf.text(`Page - ${pageNumber}`, pageWidth / 2, pageHeight - margin / 2, {
      align: "center",
    });
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // --- Production Notes Logic (shared by PDF and UI preview) ---
  const modelName =
    modelConfig?.name || modelConfig?.modelName || modelConfig?.model || "";
  const prodNotesModel = productionNotes.find((m) => m.name === modelName);

  const orderedCategories = [
    "Front Decor",
    "style",
    "Front Utility",
    "Handle",
    "Flap",
    "Rear",
    "Add-ons",
    "Straps",
  ];

  let notes = [];
  let step = 1;
  if (prodNotesModel) {
    orderedCategories.forEach((cat) => {
      const doCode =
        activeLayerPresets[cat] || activeLayerPresets[capitalize(cat)];
      if (
        doCode &&
        prodNotesModel.doOptions[cat] &&
        prodNotesModel.doOptions[cat][doCode]
      ) {
        notes.push({
          step: step++,
          category: cat,
          doCode,
          lines: prodNotesModel.doOptions[cat][doCode],
        });
      }
    });

    // Always add Closing at the end
    const closingOptions = prodNotesModel.doOptions["Closing"];
    if (closingOptions) {
      const closingKey = closingOptions["Default"]
        ? "Default"
        : Object.keys(closingOptions)[0];
      if (closingKey) {
        notes.push({
          step: step++,
          category: "Closing",
          doCode: closingKey,
          lines: closingOptions[closingKey],
        });
      }
    }
  }

  function generatePDF(snapshots) {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210,
      pageHeight = 297,
      margin = 20; // Increased bottom margin for footer
    const cols = 2,
      rows = 4;
    const circleDiameter = Math.min(
      (pageWidth - (cols + 1) * margin) / cols,
      (pageHeight - (rows + 1) * margin - 4 * 8) / rows
    );
    const imgSize = circleDiameter * 1;

    let pageNumber = 1;
    const totalPages = [];

    // Calculate total grid width/height for centering
    const gridWidth = cols * circleDiameter + (cols - 1) * margin;
    const gridHeight = rows * circleDiameter + (rows - 1) * margin + rows * 10;
    const offsetX = (pageWidth - gridWidth) / 2;
    const offsetY = (pageHeight - gridHeight) / 2;

    snapshots.forEach((snap, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const cx = offsetX + col * (circleDiameter + margin) + circleDiameter / 2;
      const cy = offsetY + row * (circleDiameter + margin) + circleDiameter / 2;

      // Draw white circle background
      pdf.setFillColor(255, 255, 255);
      pdf.circle(cx, cy, circleDiameter / 2, "F");

      // Draw image centered in the circle
      const imgX = cx - imgSize / 2;
      const imgY = cy - imgSize / 2;
      pdf.addImage(
        snap.imageData,
        snap.format.toUpperCase(),
        imgX,
        imgY,
        imgSize,
        imgSize,
        undefined,
        "NONE"
      );

      // Draw label below the circle
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      pdf.text(snap.angle, cx, cy + circleDiameter / 2 + 6, {
        align: "center",
      });
    });

    addFooter(pdf, pageNumber, pageWidth, pageHeight, margin);
    totalPages.push(pdf.internal.getCurrentPageInfo().pageNumber);

    // --- Add Inventory Tables on a new page ---
    pdf.addPage();
    pageNumber++;
    // Table 1: Lining and Interfacing
    const styleDOName = activeLayerPresets?.Style || "";
    const modelUrl = modelConfig?.modelUrl || "";
    const sourceFileName = modelUrl.split("/").pop()?.replace(".glb", "") || "";

    pdf.setFontSize(14);
    pdf.text("Table 1: Lining and Interfacing", margin, 20);

    // Table 1 header
    pdf.setFontSize(10);
    pdf.setFont(undefined, "bold");
    pdf.rect(margin, 25, 60, 8); // Item cell border
    pdf.rect(margin + 60, 25, 60, 8); // Inventory Number cell border
    pdf.text("Item", margin + 2, 31);
    pdf.text("Inventory Number", margin + 62, 31);

    pdf.setFont(undefined, "normal");
    pdf.rect(margin, 33, 60, 8);
    pdf.rect(margin + 60, 33, 60, 8);
    pdf.text("Bucket Lining", margin + 2, 39);
    pdf.text(`BL-${styleDOName}`, margin + 62, 39);

    pdf.rect(margin, 41, 60, 8);
    pdf.rect(margin + 60, 41, 60, 8);
    pdf.text("Interfacing group number", margin + 2, 47);
    pdf.text(`IF-${sourceFileName}`, margin + 62, 47);

    // Table 2: Leather, Edge paint and Hardware
    pdf.setFontSize(14);
    pdf.text("Table 2: Leather, Edge paint and Hardware", margin, 62);

    function drawTable2Header(y) {
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.rect(margin, y - 6, 40, 8); // Pattern Name
      pdf.rect(margin + 40, y - 6, 40, 8); // Material S/N
      pdf.rect(margin + 80, y - 6, 40, 8); // Edge paint S/N
      pdf.rect(margin + 120, y - 6, 40, 8); // Thread S/N
      pdf.text("Pattern Name", margin + 2, y);
      pdf.text("Material S/N", margin + 42, y);
      pdf.text("Edge paint S/N", margin + 82, y);
      pdf.text("Thread S/N", margin + 122, y);
      pdf.setFont(undefined, "normal");
    }

    let rowY = 72;
    drawTable2Header(rowY);
    rowY += 8;

    Object.entries(visibleParts || {})
      .filter(
        ([layerName, isVisible]) =>
          isVisible && !layerName.endsWith("_E") && !layerName.endsWith("_S")
      )
      .forEach(([layerName]) => {
        // Check if we need a new page
        if (rowY > pageHeight - margin - 10) {
          addFooter(pdf, pageNumber, pageWidth, pageHeight, margin);
          pdf.addPage();
          pageNumber++;
          pdf.setFontSize(14);
          pdf.text(
            "Table 2: Leather, Edge paint and Hardware (contd.)",
            margin,
            20
          );
          drawTable2Header(28);
          rowY = 36;
        }

        const selectedMaterial = useStore.getState().selectedMaterial;
        const config = modelConfig;
        const inv = inventoryData?.find(
          (item) =>
            item.leatherColor ===
            config.optionDescriptions?.Color?.[selectedMaterial]
        );

        const edgePaintChoice = (
          selectedEdgepaintColor || "black"
        ).toLowerCase();
        const threadChoice = (selectedStitchColor || "black").toLowerCase();

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

        // Draw table row with 1px border
        pdf.rect(margin, rowY - 6, 40, 8);
        pdf.rect(margin + 40, rowY - 6, 40, 8);
        pdf.rect(margin + 80, rowY - 6, 40, 8);
        pdf.rect(margin + 120, rowY - 6, 40, 8);

        pdf.text(layerName, margin + 2, rowY);
        pdf.text(inv?.materialSN || "", margin + 42, rowY);
        pdf.text(edgePaintSN, margin + 82, rowY);
        pdf.text(threadSN, margin + 122, rowY);
        rowY += 8;
      });

    addFooter(pdf, pageNumber, pageWidth, pageHeight, margin);
    totalPages.push(pdf.internal.getCurrentPageInfo().pageNumber);

    // --- Add Production Description ---
    let descY;
    if (rowY > pageHeight - margin - 30) {
      pdf.addPage();
      pageNumber++;
      descY = margin;
    } else {
      descY = rowY + 10;
    }

    pdf.setFontSize(14);
    pdf.text("Production Description", margin, descY);
    descY += 5;
    pdf.setFontSize(11);

    // Table header with borders
    const tableWidth = 120;
    const col1Width = 16;
    const col2Width = tableWidth - col1Width;
    const tableStartX = margin;
    let tableY = descY;

    // Draw header background
    pdf.setFillColor(240, 240, 240);
    pdf.rect(tableStartX, tableY, tableWidth, 8, "F");
    // Draw header borders
    pdf.setDrawColor(180, 180, 180);
    pdf.rect(tableStartX, tableY, tableWidth, 8);

    pdf.setFont(undefined, "bold");
    pdf.text("STEPS", tableStartX + 2, tableY + 6);
    pdf.text("NOTES", tableStartX + col1Width + 2, tableY + 6);
    pdf.setFont(undefined, "normal");

    // Draw vertical column border
    pdf.line(
      tableStartX + col1Width,
      tableY,
      tableStartX + col1Width,
      tableY + 8
    );

    tableY += 8;

    // Flat step-by-step notes with borders
    let flatStep = 1;
    notes.forEach((n) => {
      n.lines.forEach((line) => {
        // Row background (optional)
        // pdf.setFillColor(255, 255, 255);
        // pdf.rect(tableStartX, tableY, tableWidth, 8, "F");

        // Row borders
        pdf.setDrawColor(220, 220, 220);
        pdf.rect(tableStartX, tableY, tableWidth, 8);
        // Vertical column border
        pdf.line(
          tableStartX + col1Width,
          tableY,
          tableStartX + col1Width,
          tableY + 8
        );

        // Text
        pdf.setFont(undefined, "bold");
        pdf.text(`${flatStep}`, tableStartX + 2, tableY + 6);
        pdf.setFont(undefined, "normal");
        pdf.text(line, tableStartX + col1Width + 2, tableY + 6);

        tableY += 8;
        flatStep++;
        if (tableY > pageHeight - margin) {
          addFooter(pdf, pageNumber, pageWidth, pageHeight, margin);
          pdf.addPage();
          pageNumber++;
          tableY = margin;
        }
      });
    });

    addFooter(pdf, pageNumber, pageWidth, pageHeight, margin);

    pdf.save("Precision_Tech_Pack.pdf");
  }

  async function handleDownload() {
    setDownloadLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    generatePDF(snapshots);
    setDownloadLoading(false);
  }

  return (
    <div className="w-[28%] h-[80%] p-4 bg-white border border-gray-300 rounded-lg shadow-sm flex flex-col">
      <h2 className="font-bold mb-3.5 text-[16px] text-center">
        Advanced Tech Pack
      </h2>
      <div className="flex-1 overflow-y-auto">
        {loading && <div>Generating snapshots...</div>}
        <div className="grid grid-cols-2 gap-4">
          {snapshots.map((snap) => (
            <div key={snap.angle} className="flex flex-col items-center">
              <div
                className="rounded-full border-2 border-gray-300 bg-white flex items-center justify-center"
                style={{
                  width: 152,
                  height: 152,
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                <Image
                  src={snap.imageData}
                  alt={snap.angle}
                  width={170}
                  height={170}
                  style={{
                    objectFit: "contain",
                    borderRadius: "50%",
                    background: "#fff",
                  }}
                  className="w-full h-full"
                />
              </div>
              <span className="text-[15px] mt-1 text-black">{snap.angle}</span>
            </div>
          ))}
        </div>
        {/* Add Inventory Section below */}
        <InventorySection />

        {/* Production Description Preview */}
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-2">Production Description</h3>
          <table className="w-full text-left border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border-b border-gray-300 border-r w-16">
                  STEPS
                </th>
                <th className="px-2 py-1 border-b border-gray-300 border-l">
                  NOTES
                </th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let flatStep = 1;
                const rows = [];
                notes.forEach((n) => {
                  n.lines.forEach((line) => {
                    rows.push(
                      <tr key={flatStep}>
                        <td className="px-2 py-1 border-b border-gray-200 border-r font-semibold">
                          {flatStep}
                        </td>
                        <td className="px-2 py-1 border-b border-gray-200 border-l">
                          {line}
                        </td>
                      </tr>
                    );
                    flatStep++;
                  });
                });
                return rows;
              })()}
            </tbody>
          </table>
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={downloadLoading}
      >
        {downloadLoading ? "Downloading PDF..." : "Download (PDF)"}
      </button>
    </div>
  );
}
