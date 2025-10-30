import React, { useRef } from "react";

export default function CloudUpload({ onUploadComplete, onRemove }) {
  const fileInputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    // Get preset from backend
    const presetRes = await fetch("/api/cloud");
    const { cloudName, preset } = await presetRes.json();
    formData.append("upload_preset", preset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    if (data.secure_url) onUploadComplete(data.secure_url);
    else alert("Upload failed.");
    // Reset file input so the same file can be uploaded again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        handleFile(file);
        break;
      }
    }
  };

  // Expose a method to reset the file input from parent
  React.useImperativeHandle(onRemove?.inputRef, () => ({
    reset: () => {
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  }));

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onPaste={handlePaste}
      tabIndex={0}
      style={{ outline: "none" }}
      className="flex flex-col items-center"
    >
      <button
        className="border border-gray-300 rounded-lg px-3 py-2 bg-white hover:bg-blue-50 transition flex items-center gap-2"
        onClick={() => fileInputRef.current?.click()}
        type="button"
      >
        Upload / Drag / Paste Image
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="text-xs text-gray-500 mt-1 text-center">
        Drag & drop or paste image here
      </div>
    </div>
  );
}
