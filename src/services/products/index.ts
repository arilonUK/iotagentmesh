
import { fetchProducts } from './fetchProducts';
import { fetchProduct } from './fetchProduct';
import { createProduct } from './createProduct';
import { updateProduct } from './updateProduct';
import { deleteProduct } from './deleteProduct';
import { fetchProductProperties } from './productProperties';
import { createProductProperty } from './productProperties';
import { updateProductProperty } from './productProperties';
import { deleteProductProperty } from './productProperties';

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
  deleteProductProperty
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
  deleteProductProperty
};
