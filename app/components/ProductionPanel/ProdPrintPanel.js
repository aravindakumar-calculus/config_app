import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useStore } from "@/store/useStore";

export default function ProdPrintPanel() {
  const modelCode = useStore((s) => s.selectedModel);
  const activePresets = useStore((s) => s.activeLayerPresets);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    async function fetchPreview() {
      setPreviewLoading(true);
      setPreviewUrl("");
      const doCodes = Object.values(activePresets).filter(Boolean);
      if (!modelCode || doCodes.length === 0) {
        setPreviewLoading(false);
        return;
      }
      const res = await fetch("/api/png_files", {
        method: "POST",
        body: JSON.stringify({ model_code: modelCode, do_codes: doCodes }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const blob = await res.blob();
        setPreviewUrl(URL.createObjectURL(blob));
      }
      setPreviewLoading(false);
    }
    fetchPreview();
  }, [modelCode, activePresets]);

  // Download handler for DXF ZIP
  const handleDownload = async () => {
    setDownloadLoading(true);
    const doCodes = Object.values(activePresets).filter(Boolean);
    if (!modelCode || doCodes.length === 0) {
      setDownloadLoading(false);
      return;
    }
    const res = await fetch("/api/dxf_files", {
      method: "POST",
      body: JSON.stringify({ model_code: modelCode, do_codes: doCodes }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "DXF_File.zip";
      a.click();
      URL.revokeObjectURL(url);
    }
    setDownloadLoading(false);
  };

  return (
    <div className="w-[28%] h-[80%] p-4 bg-white border border-gray-300 rounded-lg shadow-sm flex flex-col">
      <h2 className="font-bold mb-2 text-[16px] text-center">
        DXF Files Download
      </h2>
      <div className="flex-1 overflow-y-auto">
        {previewLoading ? (
          <div>Loading preview...</div>
        ) : previewUrl ? (
          <div
            style={{
              maxHeight: "70vh",
              border: "1px solid #eee",
              background: "#fff",
              padding: 8,
            }}
          >
            <Image
              src={previewUrl}
              alt="Master PNG Preview"
              width={800}
              height={600}
              style={{
                width: "100%",
                background: "#fff",
                display: "block",
                height: "auto",
              }}
              unoptimized
            />
          </div>
        ) : (
          <div>No preview available. Select all design options.</div>
        )}
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleDownload}
        disabled={downloadLoading}
      >
        {downloadLoading ? "Preparing ZIP..." : "Download DXF Files"}
      </button>
    </div>
  );
}
