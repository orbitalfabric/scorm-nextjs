import JSZip from 'jszip';

// Parser para archivos SCORM
export class SCORMParser {
  private manifest: SCORMManifest | null = null;
  private resources: SCORMResource[] = [];
  private organizations: SCORMOrganization[] = [];
  private currentPackage: Record<string, Blob> | null = null;

  // Parsear el manifiesto SCORM (imsmanifest.xml)
  async parseManifest(xmlContent: string) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      // Verificar errores de parsing
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      if (parseError.length > 0) {
        throw new Error('Error parsing XML: ' + parseError[0].textContent);
      }

      this.manifest = this.parseManifestData(xmlDoc);
      this.resources = this.parseResources(xmlDoc);
      this.organizations = this.parseOrganizations(xmlDoc);
      
      console.log('SCORM manifest parsed successfully', this.manifest);
      return {
        manifest: this.manifest,
        resources: this.resources,
        organizations: this.organizations
      };
    } catch (error) {
      console.error('Error parsing SCORM manifest:', error);
      throw error;
    }
  }

  // Obtener el recurso inicial (punto de entrada)
  getStartingResource() {
    if (!this.manifest || !this.resources.length) {
      return null;
    }

    // Buscar el recurso con el atributo SCORM type
    const scormResource = this.resources.find(resource => 
      resource.scormType === 'sco' || resource.scormType === 'asset'
    );

    // Para Articulate Rise, buscar específicamente el scormdriver
    const articulateRiseResource = this.resources.find(resource => 
      resource.href && resource.href.includes('scormdriver/indexAPI.html')
    );

    // Priorizar scormdriver de Articulate Rise si existe
    return articulateRiseResource || scormResource || this.resources[0];
  }

  // Obtener todos los recursos navegables
  getNavigableResources() {
    return this.resources.filter(resource => 
      resource.scormType === 'sco' || !resource.scormType
    );
  }

  // Obtener recurso por identificador
  getResourceById(identifier: string) {
    return this.resources.find(resource => resource.identifier === identifier);
  }

  // Métodos privados de parsing
  private parseManifestData(xmlDoc: Document): SCORMManifest {
    const manifest = xmlDoc.querySelector('manifest');
    if (!manifest) {
      throw new Error('No manifest element found');
    }

    return {
      identifier: manifest.getAttribute('identifier') || '',
      version: manifest.getAttribute('version') || '1.3',
      xmlns: manifest.getAttribute('xmlns') || '',
      metadata: this.parseMetadata(manifest),
      schemaversion: this.getElementText(manifest, 'schemaversion') || ''
    };
  }

  private parseMetadata(manifest: Element) {
    const metadata = manifest.querySelector('metadata');
    if (!metadata) return {
      schema: '',
      schemaversion: '',
      title: '',
      description: '',
      keywords: ''
    };

    return {
      schema: this.getElementText(metadata, 'schema') || '',
      schemaversion: this.getElementText(metadata, 'schemaversion') || '',
      title: this.getElementText(metadata, 'lom > general > title > string') || 
             this.getElementText(metadata, 'title') || '',
      description: this.getElementText(metadata, 'lom > general > description > string') || 
                   this.getElementText(metadata, 'description') || '',
      keywords: this.getElementText(metadata, 'lom > general > keyword > string') || 
                this.getElementText(metadata, 'keyword') || ''
    };
  }

  private parseResources(xmlDoc: Document): SCORMResource[] {
    const resources: SCORMResource[] = [];
    const resourceElements = xmlDoc.querySelectorAll('resources > resource');
    
    resourceElements.forEach(resourceEl => {
      const resource: SCORMResource = {
        identifier: resourceEl.getAttribute('identifier') || '',
        type: resourceEl.getAttribute('type') || '',
        href: resourceEl.getAttribute('href') || '',
        scormType: resourceEl.getAttribute('adlcp:scormType') || 
                  resourceEl.getAttribute('scormType') || '',
        files: []
      };

      // Parsear archivos del recurso
      const fileElements = resourceEl.querySelectorAll('file');
      fileElements.forEach(fileEl => {
        resource.files.push({
          href: fileEl.getAttribute('href') || ''
        });
      });

      resources.push(resource);
    });

    return resources;
  }

  private parseOrganizations(xmlDoc: Document): SCORMOrganization[] {
    const organizations: SCORMOrganization[] = [];
    const orgElements = xmlDoc.querySelectorAll('organizations > organization');
    
    orgElements.forEach(orgEl => {
      const organization: SCORMOrganization = {
        identifier: orgEl.getAttribute('identifier') || '',
        structure: orgEl.getAttribute('structure') || 'hierarchical',
        title: this.getElementText(orgEl, 'title') || '',
        items: this.parseItems(orgEl)
      };
      
      organizations.push(organization);
    });

    return organizations;
  }

  private parseItems(parentElement: Element): SCORMItem[] {
    const items: SCORMItem[] = [];
    const itemElements = parentElement.querySelectorAll('item');
    
    itemElements.forEach(itemEl => {
      const item: SCORMItem = {
        identifier: itemEl.getAttribute('identifier') || '',
        identifierref: itemEl.getAttribute('identifierref') || '',
        isvisible: itemEl.getAttribute('isvisible') !== 'false',
        title: this.getElementText(itemEl, 'title') || '',
        items: this.parseItems(itemEl) // Recursivo para sub-items
      };
      
      items.push(item);
    });

    return items;
  }

  private getElementText(parent: Element, selector: string) {
    const element = parent.querySelector(selector);
    return element ? element.textContent?.trim() || '' : '';
  }

  // Método para extraer archivos ZIP
  async extractZipFile(zipFile: File) {
    try {
      const zip = await JSZip.loadAsync(zipFile);
      const files: Record<string, Blob> = {};
      
      // Extraer todos los archivos
      for (const [filename, file] of Object.entries(zip.files)) {
        if (!file.dir) {
          const content = await file.async('blob');
          files[filename] = content;
          
          // Si es el manifiesto, parsearlo
          if (filename.toLowerCase() === 'imsmanifest.xml') {
            const text = await file.async('text');
            await this.parseManifest(text);
          }
        }
      }
      
      this.currentPackage = files;
      return files;
    } catch (error) {
      console.error('Error extracting ZIP file:', error);
      throw error;
    }
  }

  // Obtener URL para un recurso
  getResourceUrl(resourceHref: string) {
    if (!this.currentPackage) {
      return null;
    }
    
    // Buscar el archivo en el paquete extraído
    for (const [filename, content] of Object.entries(this.currentPackage)) {
      if (filename.endsWith(resourceHref)) {
        return URL.createObjectURL(content);
      }
    }
    
    return null;
  }

  // Limpiar URLs de objetos creados
  cleanup() {
    if (this.currentPackage) {
      Object.values(this.currentPackage).forEach(content => {
        if (content instanceof Blob) {
          // No podemos revocar la URL aquí porque content es el Blob, no la URL
          // Las URLs se crean en getResourceUrl y deberían ser revocadas allí
        }
      });
      this.currentPackage = null;
    }
  }
}
