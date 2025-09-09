'use client';

import { useState, useRef } from 'react';

export default function TestSCORM() {
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const loadTestSCORM = () => {
    setLoading(true);
    
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = () => {
        console.log('Test iframe loaded successfully');
        setLoading(false);
      };
      
      iframe.onerror = () => {
        console.error('Test iframe failed to load');
        setLoading(false);
      };
      
      // Cargar directamente el archivo SCORM
      iframe.src = '/MY_SCORMS/Covid-19_esla/scormdriver/indexAPI.html';
      console.log('Test iframe src set');
    }
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="mb-4">
        <button
          onClick={loadTestSCORM}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Probar Carga Directa
        </button>
      </div>
      
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Cargando...</p>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        className="w-full h-full border border-gray-300 rounded"
        title="Test SCORM Content"
      />
    </div>
  );
}
