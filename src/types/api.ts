export interface ApiDocumentation {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, Schema>;
    securitySchemes?: Record<string, SecurityScheme>;
  };
  tags?: Tag[];
}

export interface PathItem {
  [method: string]: Operation | Parameter[];
}

export interface Operation {
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: Parameter[];
  responses: Record<string, Response>;
  requestBody?: RequestBody;
}

export interface Parameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  schema?: Schema;
  description?: string;
}

export interface Response {
  description: string;
  content?: Record<string, MediaType>;
}

export interface RequestBody {
  content: Record<string, MediaType>;
  required?: boolean;
}

export interface MediaType {
  schema?: Schema;
}

export interface Schema {
  type?: string;
  properties?: Record<string, Schema>;
  required?: string[];
  description?: string;
  items?: Schema;
  enum?: unknown[];
  format?: string;
  example?: unknown;
}

export interface SecurityScheme {
  type: string;
  scheme?: string;
  bearerFormat?: string;
}

export interface Tag {
  name: string;
  description?: string;
}