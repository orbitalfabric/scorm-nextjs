// Extender la interfaz Window para incluir la API SCORM
interface Window {
  API: any;
  API_1484_11: any;
  SCORMAPI?: any;
  isSCORMAvailable?: () => boolean;
}

// Definir tipos para SCORM
interface SCORMResource {
  identifier: string;
  type: string;
  href: string;
  scormType: string;
  files: Array<{ href: string }>;
}

interface SCORMManifest {
  identifier: string;
  version: string;
  xmlns: string;
  metadata: {
    schema: string;
    schemaversion: string;
    title: string;
    description: string;
    keywords: string;
  };
  schemaversion: string;
}

interface SCORMOrganization {
  identifier: string;
  structure: string;
  title: string;
  items: SCORMItem[];
}

interface SCORMItem {
  identifier: string;
  identifierref: string;
  isvisible: boolean;
  title: string;
  items: SCORMItem[];
}
