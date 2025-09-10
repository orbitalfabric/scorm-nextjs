'use client';

import { useState, useRef } from 'react';

const SCORM_COURSES = [
  {
    id: 'covid19',
    name: 'COVID-19 Seguridad',
    paths: [
      '/MY_SCORMS/Covid-19_esla/scormdriver/indexAPI.html',
      '/MY_SCORMS/Covid-19_esla/scormcontent/index.html'
    ]
  },
  {
    id: 'fase1',
    name: 'Fase 1 Fundamentos',
    paths: [
      '/Fase 1/scormdriver/indexAPI.html',
      '/Fase 1/scormcontent/index.html'
    ]
  },
  {
    id: 'procesamiento',
    name: 'Procesamiento Pedido',
    paths: [
      '/2 Procesamientodelpedido/index_lms.html',
      '/2 Procesamientodelpedido/story.html',
      '/2 Procesamientodelpedido/story_html5.html'
    ]
  }
];

export default function DebugSCORM() {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [loadStatus, setLoadStatus] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const loadCourse = () => {
    if (!selectedPath) {
      setError('Selecciona un curso y una ruta');
      return;
    }

    setLoading(true);
    setError('');
    setLoadStatus('🔄 Cargando...');

    if (iframeRef.current) {
      console.log('Intentando cargar:', selectedPath);
      
      const iframe = iframeRef.current;
      
      iframe.onload = () => {
        console.log('✅ Iframe cargado exitosamente');
        setLoading(false);
        setLoadStatus('✅ Cargado exitosamente');
        
        // Verificar contenido del iframe
        try {
          if (iframe.contentDocument) {
            const title = iframe.contentDocument.title || 'Sin título';
            setLoadStatus(`✅ Cargado: ${title}`);
          }
        } catch (e) {
          console.log('No se puede acceder al contenido del iframe (normal para contenido externo)');
          setLoadStatus('✅ Cargado (contenido protegido)');
        }
      };
      
      iframe.onerror = (e) => {
        console.error('❌ Error cargando iframe:', e);
        setLoading(false);
        setError('Error al cargar el contenido');
        setLoadStatus('❌ Error de carga');
      };

      // Timeout para detectar cargas que fallan silenciosamente
      const timeout = setTimeout(() => {
        if (loading) {
          setLoading(false);
          setError('Timeout: El contenido tardó demasiado en cargar');
          setLoadStatus('⏰ Timeout');
        }
      }, 15000);

      iframe.src = selectedPath;
      
      // Limpiar timeout si la carga es exitosa
      iframe.addEventListener('load', () => clearTimeout(timeout), { once: true });
    }
  };

  const testPathDirectly = async (path: string) => {
    try {
      setLoadStatus(`🔍 Probando: ${path}`);
      const response = await fetch(path, { method: 'HEAD' });
      
      if (response.ok) {
        console.log(`✅ Ruta accesible: ${path}`);
        setLoadStatus(`✅ Ruta accesible: ${response.status}`);
      } else {
        console.log(`❌ Ruta no accesible: ${path} - ${response.status}`);
        setLoadStatus(`❌ Error ${response.status}: ${path}`);
      }
    } catch (error) {
      console.error(`❌ Error probando ruta: ${path}`, error);
      setLoadStatus(`❌ Error de red: ${path}`);
    }
  };

  const course = SCORM_COURSES.find(c => c.id === selectedCourse);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🐛 Debug SCORM Viewer</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de controles */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Seleccionar Curso</h2>
            
            <div className="space-y-3">
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedPath('');
                }}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Selecciona un curso...</option>
                {SCORM_COURSES.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>

              {course && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ruta del archivo:
                  </label>
                  <select
                    value={selectedPath}
                    onChange={(e) => setSelectedPath(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">Selecciona una ruta...</option>
                    {course.paths.map((path, index) => (
                      <option key={index} value={path}>
                        {path}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={loadCourse}
                  disabled={!selectedPath || loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
                >
                  {loading ? '🔄 Cargando...' : '▶️ Cargar en Iframe'}
                </button>
                
                {selectedPath && (
                  <button
                    onClick={() => testPathDirectly(selectedPath)}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    🔍 Probar Ruta
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold mb-2">Estado:</h3>
            <div className="text-sm">
              <div>📄 Curso: {course?.name || 'Ninguno'}</div>
              <div>🔗 Ruta: {selectedPath || 'Ninguna'}</div>
              <div>📊 Estado: {loadStatus || 'Esperando...'}</div>
              {error && <div className="text-red-600">❌ Error: {error}</div>}
            </div>
          </div>

          {/* Pruebas rápidas */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold mb-2">🚀 Pruebas Rápidas:</h3>
            <div className="space-y-2">
              {SCORM_COURSES.map(course => 
                course.paths.map((path, index) => (
                  <button
                    key={`${course.id}-${index}`}
                    onClick={() => {
                      setSelectedCourse(course.id);
                      setSelectedPath(path);
                      setTimeout(() => loadCourse(), 100);
                    }}
                    className="block w-full text-left p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    {course.name}: {path.split('/').pop()}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold mb-2">ℹ️ Info Técnica:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>URL Base: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</div>
              <div>User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'N/A'}</div>
              <div>Protocolo: {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Iframe */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">📺 Vista Previa</h2>
            {selectedPath && (
              <div className="text-sm text-gray-600 mt-1">
                <strong>Cargando:</strong> {selectedPath}
              </div>
            )}
          </div>
          
          <div className="relative">
            <iframe
              ref={iframeRef}
              className="w-full h-96 border-none"
              title="SCORM Content Preview"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
            />
            
            {!selectedPath && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📺</div>
                  <p>Selecciona un curso para ver la vista previa</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enlaces de test directo */}
      <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="font-semibold mb-2">🔗 Enlaces de Prueba Directa:</h3>
        <p className="text-sm text-gray-600 mb-2">Haz clic en estos enlaces para probar el acceso directo:</p>
        <div className="space-y-1">
          {SCORM_COURSES.map(course => 
            course.paths.map((path, index) => (
              <div key={`${course.id}-${index}`}>
                <a
                  href={path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  🔗 {course.name}: {path}
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}