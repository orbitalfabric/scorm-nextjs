'use client';

import { useState, useEffect, useRef } from 'react';
import { SCORMParser } from '@/lib/scorm-parser';
import { initializeSCORMAPI } from '@/lib/scorm-api';

interface SCORMViewerProps {
  scormPath?: string;
}

export default function SCORMViewer({ scormPath }: SCORMViewerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResource, setCurrentResource] = useState(0);
  const [resources, setResources] = useState<any[]>([]);
  const [packageInfo, setPackageInfo] = useState<any>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  // Inicializar API SCORM al montar el componente
  useEffect(() => {
    initializeSCORMAPI();
  }, []);

  // Cargar SCORM automáticamente si se proporciona una ruta al montar
  useEffect(() => {
    if (scormPath && resources.length === 0) {
      loadSCORM(scormPath);
    }
  }, [scormPath]);

  const loadSCORM = async (scormType: string) => {
    setLoading(true);
    setError(null);
    console.log('Iniciando carga de SCORM:', scormType);

    try {
      let scormPath;
      let scormName;

      // Determinar la ruta según el tipo de SCORM
      if (scormType === 'Covid-19_esla') {
        scormPath = '/MY_SCORMS/Covid-19_esla/scormdriver/indexAPI.html';
        scormName = 'COVID-19';
        console.log('Ruta SCORM configurada:', scormPath);
      } else {
        throw new Error('Tipo de SCORM no reconocido');
      }

      // Configurar recursos
      const scormResources = [{
        identifier: 'local-scorm',
        type: 'webcontent',
        href: scormPath,
        scormType: 'sco',
        files: []
      }];

      setResources(scormResources);
      setPackageInfo({
        title: scormName,
        description: 'La respuesta a COVID-19 requiere mayor seguridad alimentaria, higiene y normas de limpieza.',
        version: '1.2',
        type: 'Articulate Rise'
      });

      console.log('Recursos configurados, cargando primer recurso...');
      
      // Cargar primer recurso
      setCurrentResource(0);
      await loadCurrentResource();

    } catch (error) {
      console.error('Error loading SCORM:', error);
      setError(`Error al cargar SCORM: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentResource = async () => {
    if (resources.length === 0) {
      console.log('No hay recursos para cargar');
      return;
    }

    const resource = resources[currentResource];
    setLoading(true);
    console.log('Cargando recurso:', resource);

    try {
      const resourceUrl = resource.href;

      if (!resourceUrl) {
        throw new Error(`No se pudo encontrar el recurso: ${resource.href}`);
      }

      console.log('URL del recurso:', resourceUrl);

      // Usar la referencia del contenedor
      if (iframeContainerRef.current) {
        iframeContainerRef.current.innerHTML = ''; // Limpiar contenedor
        
        const newIframe = document.createElement('iframe');
        newIframe.src = resourceUrl;
        newIframe.style.width = '100%';
        newIframe.style.height = '100%';
        newIframe.style.border = 'none';
        newIframe.style.display = 'block';
        newIframe.title = 'SCORM Content';
        
        newIframe.onload = () => {
          console.log('Iframe cargado exitosamente');
          setLoading(false);
          injectSCORMAPI(newIframe);
        };
        
        newIframe.onerror = () => {
          console.error('Error al cargar el iframe');
          setLoading(false);
          setError('Error al cargar el contenido');
        };
        
        iframeContainerRef.current.appendChild(newIframe);
        console.log('Iframe agregado al contenedor');
      } else {
        console.error('No se encontró el contenedor del iframe');
        setLoading(false);
        setError('Error: Contenedor no disponible');
      }

    } catch (error) {
      console.error('Error loading resource:', error);
      setError(`Error al cargar el recurso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setLoading(false);
    }
  };

  const injectSCORMAPI = (iframe: HTMLIFrameElement) => {
    try {
      // Para Articulate Rise, no inyectar la API ya que usa su propio scormdriver
      if (iframe.src.includes('scormdriver/')) {
        console.log('Articulate Rise detected - using built-in scormdriver');
        return;
      }
      
      const scormAPIScript = `
        <script>
          // API SCORM completa para Articulate Rise
          window.API = {
            LMSInitialize: function() { return "true"; },
            LMSFinish: function() { return "true"; },
            LMSCommit: function() { return "true"; },
            LMSGetValue: function(element) { return ""; },
            LMSSetValue: function(element, value) { return "true"; },
            LMSGetLastError: function() { return "0"; },
            LMSGetErrorString: function(errorCode) { return "No error"; },
            LMSGetDiagnostic: function(errorCode) { return "No diagnostic"; }
          };
          window.API_1484_11 = window.API;
          
          // Hacer la API disponible en el contexto padre también
          if (window.parent && !window.parent.API) {
            window.parent.API = window.API;
            window.parent.API_1484_11 = window.API;
          }
          console.log('SCORM API pre-injected for Articulate Rise');
        </script>
      `;
      
      if (iframe.contentDocument) {
        iframe.contentDocument.write(scormAPIScript);
      }
    } catch (error) {
      console.warn('Could not inject SCORM API into iframe:', error);
    }
  };

  const navigate = (direction: number) => {
    const newIndex = currentResource + direction;
    if (newIndex >= 0 && newIndex < resources.length) {
      setCurrentResource(newIndex);
    }
  };

  const reloadFrame = () => {
    // Recargar la página para simplificar
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {error}
        <div className="mt-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: '100vh' }}>
      {/* Contenido principal */}
      <div className="flex-1 flex" style={{ minHeight: 0 }}>
        {/* Panel lateral */}
        <div className="w-80 bg-gray-50 p-6 border-r border-gray-200 flex flex-col">
          <div className="text-center mb-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
            <h1 className="text-xl font-bold mb-2">SCORM Viewer</h1>
            <p className="text-sm opacity-90">Visualizador de contenido</p>
          </div>

          <div className="flex-1 space-y-6">
            {/* Controles de SCORM */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Contenidos SCORM</h3>
              <button
                onClick={() => loadSCORM('Covid-19_esla')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded mb-2"
              >
                SCORM 1 - COVID-19
              </button>
              <button
                onClick={reloadFrame}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded"
              >
                Recargar
              </button>
            </div>

            {/* Navegación */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Navegación</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate(-1)}
                  disabled={currentResource === 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-2 px-4 rounded"
                >
                  Anterior
                </button>
                <button
                  onClick={() => navigate(1)}
                  disabled={currentResource === resources.length - 1}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-2 px-4 rounded"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>

          {/* Panel de información */}
          {packageInfo && (
            <div className="mt-auto bg-white p-4 rounded-lg border border-gray-200">
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Estado:</strong> <span>{loading ? 'Cargando...' : 'Listo'}</span>
                </div>
                <div>
                  <strong>Recurso:</strong> <span>{resources.length > 0 ? `${currentResource + 1}/${resources.length}` : '0/0'}</span>
                </div>
                <div>
                  <strong>Tipo:</strong> <span>{packageInfo.type}</span>
                </div>
                <div>
                  <strong>Título:</strong> <span>{packageInfo.title}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contenedor para el iframe */}
        <div ref={iframeContainerRef} className="flex-1" style={{ position: 'relative', border: '2px solid red' }}>
          {/* El iframe se creará dinámicamente aquí */}
        </div>
      </div>
    </div>
  );
}
