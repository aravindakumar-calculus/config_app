import { useState, useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import CloudUpload from "./CloudUpload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

export default function ChatBotViewer() {
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiCaption, setAiCaption] = useState("");
  const [pendingDOs, setPendingDOs] = useState(null);
  const [imageLoading, setImageLoading] = useState(false); // NEW

  const setSelectedModel = useStore((s) => s.setSelectedModel);
  const setActiveLayerPreset = useStore((s) => s.setActiveLayerPreset);
  const configLoaded = useStore((s) => s.configLoaded);
  const resetConfigLoaded = useStore((s) => s.resetConfigLoaded);

  // Ref to reset file input in CloudUpload
  const fileInputResetRef = useRef();

  useEffect(() => {
    if (pendingDOs && configLoaded) {
      const DO_KEY_MAP = {
        Handle: "Handle",
        Closure: "Flap",
        Front: "Front Decor",
        FrontPocket: "Front Utility",
        Strap: "Straps",
        Rear: "Rear",
        AddOn: "Add-ons",
      };
      Object.entries(DO_KEY_MAP).forEach(([aiKey, configKey]) => {
        if (pendingDOs[aiKey])
          setActiveLayerPreset(configKey, pendingDOs[aiKey]);
      });
      setPendingDOs(null);
      resetConfigLoaded();
    }
  }, [pendingDOs, configLoaded, setActiveLayerPreset, resetConfigLoaded]);

  const handleDirectMatch = async () => {
    setLoading(true);
    setAiCaption("");
    try {
      const res = await fetch("/api/direct_match", {
        method: "POST",
        body: JSON.stringify({
          imageUrl: imageUrl || undefined,
          text: input || undefined,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.style) {
        resetConfigLoaded();
        await setSelectedModel(data.style);
        setPendingDOs(data);
      }
      if (data.caption) setAiCaption(data.caption);
    } catch (err) {
      console.log("Direct AI matching failed.", err);
    }
    setLoading(false);
  };

  // Remove image and reset file input
  const handleRemoveImage = () => {
    setImageUrl("");
    if (fileInputResetRef.current && fileInputResetRef.current.reset) {
      fileInputResetRef.current.reset();
    }
  };

  // When a new image is uploaded, show spinner until loaded
  useEffect(() => {
    if (imageUrl) setImageLoading(true);
  }, [imageUrl]);

  // Optional: Focus the upload area for paste/drag events
  const uploadAreaRef = useRef();

  return (
    <aside className="w-[28%] h-[80%] p-4 bg-white flex flex-col border border-gray-300 rounded-lg shadow-sm">
      <div className="text-center font-bold border-b border-gray-100 pb-3 mb-5 mt-2 text-gray-900 text-xl tracking-wide">
        DESIGN WITH CALCULUS
      </div>
      <div className="flex-1 mb-4 bg-gray-50 border border-gray-100 rounded-lg flex flex-col gap-3 p-4">
        <textarea
          className="w-full h-24 resize-none p-3 bg-white outline-none text-gray-800 rounded-lg border border-gray-200 focus:border-blue-400 transition"
          placeholder="Describe your handbag or paste a prompt here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <div className="flex items-center gap-3" ref={uploadAreaRef}>
          <CloudUpload
            onUploadComplete={setImageUrl}
            onRemove={{ inputRef: fileInputResetRef }}
          />
          {imageUrl && (
            <div className="ml-2 flex flex-col items-center">
              <div style={{ position: "relative" }}>
                {imageLoading && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "56px",
                      height: "56px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255,255,255,0.7)",
                      borderRadius: "8px",
                      zIndex: 2,
                    }}
                  >
                    <FontAwesomeIcon icon={faSpinner} spin size="lg" />
                  </div>
                )}
                <Image
                  src={imageUrl}
                  alt="Uploaded"
                  width={56}
                  height={56}
                  className="h-14 w-14 object-cover rounded-lg border border-gray-300 shadow"
                  onLoad={() => setImageLoading(false)}
                  style={imageLoading ? { opacity: 0.5 } : {}}
                />
              </div>
              <button
                className="text-xs text-red-500 mt-1 hover:underline"
                onClick={handleRemoveImage}
                disabled={loading}
              >
                Remove
              </button>
            </div>
          )}
        </div>
        {aiCaption && (
          <div className="text-xs text-gray-700 mt-2 bg-gray-100 rounded p-2">
            <b>AI Caption:</b> {aiCaption}
          </div>
        )}
      </div>
      <div className="flex gap-3 mt-2">
        <button
          className="border border-green-700 rounded-lg px-4 py-2 flex-1 bg-green-700 text-white hover:bg-green-800 transition flex items-center justify-center font-semibold"
          onClick={handleDirectMatch}
          disabled={loading || (!input && !imageUrl)}
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              Matching...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
              Match
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
