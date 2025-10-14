import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUndo, faRedo } from "@fortawesome/free-solid-svg-icons";

export default function ChatBotViewer() {
  return (
    <aside className="w-[28%] h-[80%] p-4 bg-white flex flex-col border border-gray-300 rounded-lg shadow-sm">
      <div className="text-center font-bold border-b border-gray-200 pb-2 mb-4 mt-2 text-gray-800 text-lg tracking-wide">
        DESIGN WITH CALCULUS
      </div>
      <div className="flex-1 mb-3 bg-gray-50 border border-gray-100 rounded flex">
        {/* Text area with scroll bar on left side */}
        <textarea
          className="w-full h-full resize-none p-2 bg-transparent outline-none text-gray-800 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          style={{ minHeight: 0 }}
          placeholder="Type your message here..."
        />
      </div>
      <div className="flex gap-2">
        <button className="border border-gray-400 rounded px-4 py-2 bg-white hover:bg-gray-100 transition">
          Save
        </button>
        <div className="flex gap-2 items-center">
          <button
            className="border border-gray-400 rounded px-3 py-2 bg-white hover:bg-gray-100 transition"
            title="Undo"
          >
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <button
            className="border border-gray-400 rounded px-3 py-2 bg-white hover:bg-gray-100 transition"
            title="Redo"
          >
            <FontAwesomeIcon icon={faRedo} />
          </button>
        </div>
        <button className="border border-gray-400 rounded px-4 py-2 flex-1 bg-gray-800 text-white hover:bg-gray-700 transition">
          ADD TO CART
        </button>
      </div>
    </aside>
  );
}
