"use client";
import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import HandbagModel from "../../designmodule/HandbagModel";

export default function MainScene({ onLoaded }) {
  const { invalidate } = useThree();

  useEffect(() => {
    invalidate();
  }, [invalidate]);

  return <HandbagModel onLoaded={onLoaded} />;
}
