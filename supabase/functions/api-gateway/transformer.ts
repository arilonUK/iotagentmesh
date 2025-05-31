
export interface TransformationRule {
  path: string;
  method: string;
  requestTransforms?: {
    headers?: Record<string, string>;
    body?: (body: any) => any;
  };
  responseTransforms?: {
    headers?: Record<string, string>;
    body?: (body: any) => any;
  };
}

export class RequestResponseTransformer {
  private rules: TransformationRule[] = [];

  addRule(rule: TransformationRule) {
    this.rules.push(rule);
  }

  transformRequest(path: string, method: string, headers: Headers, body: any): { headers: Record<string, string>; body: any } {
    const rule = this.rules.find(r => 
      new RegExp(r.path).test(path) && r.method.toLowerCase() === method.toLowerCase()
    );

    if (!rule?.requestTransforms) {
      return { headers: {}, body };
    }

    const transformedHeaders = { ...rule.requestTransforms.headers };
    const transformedBody = rule.requestTransforms.body ? rule.requestTransforms.body(body) : body;

    return { headers: transformedHeaders, body: transformedBody };
  }

  transformResponse(path: string, method: string, responseBody: any): { headers: Record<string, string>; body: any } {
    const rule = this.rules.find(r => 
      new RegExp(r.path).test(path) && r.method.toLowerCase() === method.toLowerCase()
    );

    if (!rule?.responseTransforms) {
      return { headers: {}, body: responseBody };
    }

    const transformedHeaders = { ...rule.responseTransforms.headers };
    const transformedBody = rule.responseTransforms.body ? rule.responseTransforms.body(responseBody) : responseBody;

    return { headers: transformedHeaders, body: transformedBody };
  }
}

// Default transformation rules
export const defaultTransformationRules: TransformationRule[] = [
  {
    path: '/api/devices',
    method: 'GET',
    responseTransforms: {
      headers: { 'X-Data-Source': 'devices-api' },
      body: (body: any) => ({
        ...body,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      })
    }
  },
  {
    path: '/api/.*',
    method: 'POST',
    requestTransforms: {
      headers: { 'X-Request-ID': crypto.randomUUID() }
    }
  }
];
