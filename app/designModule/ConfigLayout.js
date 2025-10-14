"use client";
import React from "react";
import ChatBotViewer from "@/app/components/ChatBotViewer/ChatBotViewer";
import ModelViewer from "@/app/components/ModelViewer/ModelViewer";
import CustomizeViewer from "../components/CustomizeViewer/CustomizeViewer";

export default function ConfigLayout({ controlsRef }) {
  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen lg:h-screen pt-5 bg-gray-100 font-sans overflow-y-auto lg:overflow-hidden  justify-between">
      <div className="w-[5%]"></div>
      <ChatBotViewer controlsRef={controlsRef} />
      <CustomizeViewer controlsRef={controlsRef} />
      <ModelViewer controlsRef={controlsRef} />
      <div className="w-[5%]"></div>
    </div>
  );
}
