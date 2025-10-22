import React, { useRef } from "react";

export default function CloudUpload({ onUploadComplete, onRemove }) {
  const fileInputRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
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

  // Expose a method to reset the file input from parent
  React.useImperativeHandle(onRemove?.inputRef, () => ({
    reset: () => {
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  }));

  return (
    <>
      <button
        className="border border-gray-300 rounded-lg px-3 py-2 bg-white hover:bg-blue-50 transition flex items-center gap-2"
        onClick={() => fileInputRef.current?.click()}
      >
        Upload Image
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}
