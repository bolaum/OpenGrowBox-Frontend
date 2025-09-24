import React, { useState, useRef } from "react";

const PlantLiveViewer = () => {
  const [streamUrl, setStreamUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const videoRef = useRef(null);

  const handleLoadStream = () => {
    setCurrentUrl(streamUrl);
  };

  return (
    <div className="flex flex-col items-center w-full h-full p-4 bg-gray-100 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Plant Live Viewer</h2>

      {/* Eingabefeld für URL */}
      <div className="flex w-full max-w-3xl mb-4">
        <input
          type="text"
          placeholder="Gib hier die Stream-URL ein..."
          value={streamUrl}
          onChange={(e) => setStreamUrl(e.target.value)}
          className="flex-1 p-2 rounded-l-xl border-2 border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={handleLoadStream}
          className="p-2 bg-green-500 text-white font-bold rounded-r-xl hover:bg-green-600 transition-colors"
        >
          Laden
        </button>
      </div>

      {/* Video-Player */}
      {currentUrl ? (
        <video
          ref={videoRef}
          src={currentUrl}
          controls
          autoPlay
          muted
          playsInline
          className="rounded-xl w-full max-w-3xl shadow-md border-2 border-green-400"
        />
      ) : (
        <div className="flex justify-center items-center w-full max-w-3xl h-64 bg-black rounded-xl text-white">
          Gib eine Stream-URL ein, um das Video zu sehen
        </div>
      )}
    </div>
  );
};

export default PlantLiveViewer;
