"use client";
import React from "react";
import CanvasViewer from "./CanvasViewer";

export default function ModelViewer({ controlsRef }) {
  return (
    <div className="flex w-[28%] h-[80%] flex-row overflow-hidden border border-gray-300 rounded-lg shadow-sm">
      <div className="flex flex-col flex-1 h-full min-w-0">
        <CanvasViewer controlsRef={controlsRef} />
      </div>
    </div>
  );
}
