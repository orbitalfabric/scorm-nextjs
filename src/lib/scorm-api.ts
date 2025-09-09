// API SCORM 1.2 y 2004 para React/Next.js
export class SCORMAPI {
  private initialized = false;
  private terminated = false;
  private data: Record<string, any> = {};
  private version = '1.2';
  private cmi = {
    core: {
      student_id: '',
      student_name: '',
      lesson_location: '',
      credit: '',
      lesson_status: 'not attempted',
      entry: '',
      score: {
        raw: '',
        min: '',
        max: '',
        scaled: ''
      },
      total_time: '0000:00:00',
      lesson_mode: 'normal',
      exit: '',
      session_time: '0000:00:00'
    },
    suspend_data: '',
    launch_data: '',
    comments: '',
    objectives: {} as Record<string, any>,
    student_data: {
      mastery_score: '',
      max_time_allowed: '',
      time_limit_action: ''
    },
    student_preference: {
      audio: '0',
      language: '',
      speed: '0',
      text: '0'
    },
    interactions: {} as Record<string, any>
  };

  // Inicializar la comunicación SCORM
  LMSInitialize(param: string = '') {
    if (this.initialized) {
      return 'false';
    }
    
    this.initialized = true;
    this.terminated = false;
    
    // Cargar datos guardados si existen
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('scorm_data');
      if (savedData) {
        this.data = JSON.parse(savedData);
      }
    }
    
    console.log('SCORM API initialized');
    return 'true';
  }

  // Terminar la comunicación SCORM
  LMSFinish(param: string = '') {
    if (!this.initialized || this.terminated) {
      return 'false';
    }
    
    // Guardar datos antes de terminar
    if (typeof window !== 'undefined') {
      localStorage.setItem('scorm_data', JSON.stringify(this.data));
    }
    
    this.terminated = true;
    console.log('SCORM API terminated');
    return 'true';
  }

  // Obtener valor
  LMSGetValue(element: string) {
    if (!this.initialized || this.terminated) {
      return '';
    }
    
    const value = this.getElementValue(element);
    console.log(`SCORM GetValue: ${element} = ${value}`);
    return value;
  }

  // Establecer valor
  LMSSetValue(element: string, value: string) {
    if (!this.initialized || this.terminated) {
      return 'false';
    }
    
    const success = this.setElementValue(element, value);
    console.log(`SCORM SetValue: ${element} = ${value} (${success ? 'success' : 'failed'})`);
    return success ? 'true' : 'false';
  }

  // Obtener mensaje de error
  LMSGetLastError() {
    return '0'; // No error
  }

  // Obtener descripción del error
  LMSGetErrorString(errorCode: string) {
    const errors: Record<string, string> = {
      '0': 'No error',
      '101': 'General exception',
      '201': 'Invalid argument error',
      '202': 'Element cannot have children',
      '203': 'Element not an array - cannot have count',
      '301': 'Not initialized',
      '401': 'Not implemented error',
      '402': 'Invalid set value, element is a keyword',
      '403': 'Element is read only',
      '404': 'Element is write only',
      '405': 'Incorrect data type'
    };
    return errors[errorCode] || 'Unknown error';
  }

  // Obtener diagnóstico del error
  LMSGetDiagnostic(errorCode: string) {
    return `Error ${errorCode}: ${this.LMSGetErrorString(errorCode)}`;
  }

  // Métodos auxiliares privados
  private getElementValue(element: string) {
    const path = element.split('.');
    let current: any = this.cmi;
    
    for (const part of path) {
      if (current[part] === undefined) {
        return '';
      }
      current = current[part];
    }
    
    return current !== undefined ? current : '';
  }

  private setElementValue(element: string, value: string) {
    const path = element.split('.');
    let current: any = this.cmi;
    
    for (let i = 0; i < path.length - 1; i++) {
      const part = path[i];
      if (current[part] === undefined) {
        current[part] = {};
      }
      current = current[part];
    }
    
    const lastPart = path[path.length - 1];
    
    // Validaciones básicas según el estándar SCORM
    switch (element) {
      case 'cmi.core.lesson_status':
        const validStatuses = ['passed', 'completed', 'failed', 'incomplete', 'browsed', 'not attempted'];
        if (!validStatuses.includes(value)) {
          return false;
        }
        break;
        
      case 'cmi.core.score.raw':
        if (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100) {
          return false;
        }
        break;
        
      case 'cmi.suspend_data':
        // Limitar tamaño según especificación SCORM
        if (value.length > 4096) {
          return false;
        }
        break;
    }
    
    current[lastPart] = value;
    return true;
  }

  // Comandos adicionales para SCORM 2004
  Commit(param: string = '') {
    return this.LMSFinish(param);
  }

  GetValue(element: string) {
    return this.LMSGetValue(element);
  }

  SetValue(element: string, value: string) {
    return this.LMSSetValue(element, value);
  }
}

// Función para verificar si SCORM está disponible
export const isSCORMAvailable = () => {
  return typeof window !== 'undefined' && 
         typeof window.API !== 'undefined' && 
         typeof (window.API as any).LMSInitialize === 'function' &&
         typeof (window.API as any).LMSFinish === 'function';
};

// Función para inicializar la API SCORM globalmente
export const initializeSCORMAPI = () => {
  if (typeof window !== 'undefined') {
    const api = new SCORMAPI();
    window.API = api as any;
    window.API_1484_11 = api as any;
    return api;
  }
  return null;
};
