
import { ApiGatewayClient } from './ApiGatewayClient';
import { OpenApiDocumentationService } from './OpenApiDocumentationService';
import { PostmanCollectionService } from './PostmanCollectionService';

// Create singleton instances
const apiGatewayClient = new ApiGatewayClient();
const openApiService = new OpenApiDocumentationService(apiGatewayClient);
const postmanService = new PostmanCollectionService(openApiService);

// Export the main service interface for backward compatibility
export const apiGatewayService = {
  request: apiGatewayClient.request.bind(apiGatewayClient),
  getDocumentation: openApiService.getDocumentation.bind(openApiService),
  getDocumentationUrl: apiGatewayClient.getDocumentationUrl.bind(apiGatewayClient),
  generatePostmanCollection: postmanService.generatePostmanCollection.bind(postmanService),
  downloadPostmanCollection: postmanService.downloadPostmanCollection.bind(postmanService),
};

// Export types and classes for direct usage
export type { ApiGatewayRequest, ApiGatewayResponse } from './ApiGatewayClient';
export type { ApiDocumentation } from './OpenApiDocumentationService';
export { ApiGatewayClient, OpenApiDocumentationService, PostmanCollectionService };
