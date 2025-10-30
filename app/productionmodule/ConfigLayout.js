"use client";
import React from "react";
import ProdPrintPanel from "../components/ProductionPanel/ProdPrintPanel";
import TechPack from "../components/PrecisionTechPack/TechPack";
import ModelDownload from "../components/ModelDownload/ModelDownload";

export default function ConfigLayout() {
  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen lg:h-screen pt-5 bg-gray-100 font-sans overflow-y-auto lg:overflow-hidden  justify-between">
      <div className="w-[5%]"></div>
      <ProdPrintPanel />
      <TechPack />
      <ModelDownload />
      <div className="w-[5%]"></div>
    </div>
  );
}
