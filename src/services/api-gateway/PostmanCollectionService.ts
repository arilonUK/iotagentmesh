
import { OpenApiDocumentationService, ApiDocumentation } from './OpenApiDocumentationService';

export interface PostmanCollection {
  info: {
    name: string;
    description: string;
    version: string;
    schema: string;
  };
  auth: {
    type: string;
    bearer: {
      token: string;
    };
  };
  variable: Array<{
    key: string;
    value: string;
    type: string;
  }>;
  item: Array<any>;
}

export class PostmanCollectionService {
  constructor(private documentationService: OpenApiDocumentationService) {}

  /**
   * Generate Postman collection from OpenAPI spec
   */
  async generatePostmanCollection(): Promise<PostmanCollection | null> {
    try {
      const documentation = await this.documentationService.getDocumentation();
      
      if (!documentation) {
        console.error('No API documentation available for Postman collection generation');
        return null;
      }

      const collection: PostmanCollection = {
        info: {
          name: documentation.info.title,
          description: documentation.info.description,
          version: documentation.info.version,
          schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        auth: {
          type: "bearer",
          bearer: {
            token: "{{api_key}}"
          }
        },
        variable: [
          {
            key: "base_url",
            value: "https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-gateway",
            type: "string"
          },
          {
            key: "api_key",
            value: "iot_your_api_key_here",
            type: "string"
          }
        ],
        item: []
      };

      // Convert OpenAPI paths to Postman requests
      if (documentation.paths) {
        for (const [path, pathItem] of Object.entries(documentation.paths)) {
          const folderName = this.getFolderNameFromPath(path);
          let folder = collection.item.find(item => item.name === folderName);
          
          if (!folder) {
            folder = {
              name: folderName,
              item: []
            };
            collection.item.push(folder);
          }

          for (const [method, operation] of Object.entries(pathItem)) {
            if (method === 'parameters') continue;
            
            const request = this.createPostmanRequest(path, method, operation as any);
            folder.item.push(request);
          }
        }
      }

      return collection;
    } catch (error) {
      console.error('Error generating Postman collection:', error);
      return null;
    }
  }

  /**
   * Download Postman collection as JSON file
   */
  async downloadPostmanCollection(): Promise<void> {
    try {
      const collection = await this.generatePostmanCollection();
      
      if (!collection) {
        throw new Error('Failed to generate Postman collection');
      }

      const blob = new Blob([JSON.stringify(collection, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'iot-platform-api.postman_collection.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Postman collection:', error);
      throw error;
    }
  }

  private getFolderNameFromPath(path: string): string {
    const segments = path.split('/').filter(segment => segment && !segment.startsWith('{'));
    
    if (segments.includes('devices')) return 'Devices';
    if (segments.includes('products')) return 'Products';
    if (segments.includes('endpoints')) return 'Endpoints';
    if (segments.includes('data-buckets')) return 'Data';
    if (segments.includes('organizations')) return 'Organizations';
    if (segments.includes('user')) return 'User';
    
    return 'General';
  }

  private createPostmanRequest(path: string, method: string, operation: any) {
    const url = {
      raw: `{{base_url}}${path}`,
      host: ["{{base_url}}"],
      path: path.split('/').filter(segment => segment)
    };

    const request: any = {
      name: operation.summary || `${method.toUpperCase()} ${path}`,
      request: {
        method: method.toUpperCase(),
        header: [
          {
            key: "Content-Type",
            value: "application/json",
            type: "text"
          }
        ],
        url,
        description: operation.description || ''
      }
    };

    // Add auth if required
    if (operation.security) {
      request.request.auth = {
        type: "bearer",
        bearer: {
          token: "{{api_key}}"
        }
      };
    }

    // Add request body for POST/PUT requests
    if (operation.requestBody && ['post', 'put'].includes(method)) {
      const schema = operation.requestBody.content?.['application/json']?.schema;
      if (schema) {
        request.request.body = {
          mode: "raw",
          raw: JSON.stringify(this.generateExampleFromSchema(schema), null, 2),
          options: {
            raw: {
              language: "json"
            }
          }
        };
      }
    }

    // Add query parameters
    if (operation.parameters) {
      const queryParams = operation.parameters
        .filter((param: any) => param.in === 'query')
        .map((param: any) => ({
          key: param.name,
          value: this.getExampleValue(param.schema),
          description: param.description || '',
          disabled: !param.required
        }));
      
      if (queryParams.length > 0) {
        request.request.url.query = queryParams;
      }
    }

    return request;
  }

  private generateExampleFromSchema(schema: any): any {
    if (!schema) return {};

    if (schema.type === 'object' && schema.properties) {
      const example: any = {};
      for (const [key, prop] of Object.entries(schema.properties)) {
        example[key] = this.getExampleValue(prop as any);
      }
      return example;
    }

    return this.getExampleValue(schema);
  }

  private getExampleValue(schema: any): any {
    if (!schema) return '';

    if (schema.example !== undefined) return schema.example;
    if (schema.default !== undefined) return schema.default;

    switch (schema.type) {
      case 'string':
        if (schema.format === 'uuid') return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
        if (schema.format === 'date-time') return new Date().toISOString();
        if (schema.format === 'email') return 'user@example.com';
        return 'string';
      case 'number':
      case 'integer':
        return 0;
      case 'boolean':
        return true;
      case 'array':
        return [this.getExampleValue(schema.items)];
      case 'object':
        return {};
      default:
        return '';
    }
  }
}
