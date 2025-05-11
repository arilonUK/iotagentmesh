
import { fetchProducts } from './fetchProducts';
import { fetchProduct } from './fetchProduct';
import { createProduct } from './createProduct';
import { updateProduct } from './updateProduct';
import { deleteProduct } from './deleteProduct';
import { fetchProductProperties } from './fetchProductProperties';
import { createProductProperty } from './createProductProperty';
import { updateProductProperty } from './updateProductProperty';
import { deleteProductProperty } from './deleteProductProperty';
import { propertyTemplateService } from './propertyTemplateService';
import { productServiceService } from './productServiceService';

// Export as a single service object for backward compatibility
export const productServices = {
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchProductProperties,
  createProductProperty,
  updateProductProperty,
  deleteProductProperty,
  // Add new services
  ...propertyTemplateService,
  ...productServiceService
};

// Also export individual functions for more targeted imports
export {
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchProductProperties,
  createProductProperty,
  updateProductProperty,
  deleteProductProperty,
  propertyTemplateService,
  productServiceService
};
