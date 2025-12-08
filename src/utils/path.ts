/**
 * Utility functions for handling paths in the application
 * This is especially important for GitHub Pages deployment
 */

/**
 * Get the base path for the application
 * This will be empty in development and the repository name in production
 */
export const getBasePath = (): string => {
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
};

/**
 * Prefix a path with the base path
 * @param path The path to prefix
 * @returns The path with the base path prefixed
 */
export const withBasePath = (path: string): string => {
  const basePath = getBasePath();

  // For external links, return as is
  if (path.startsWith('http') || path.startsWith('//')) {
    return path;
  }

  // If the path already starts with the base path, return it as is
  if (basePath && path.startsWith(basePath)) {
    return path;
  }

  // If the path starts with a slash, append it to the base path
  if (path.startsWith('/')) {
    return `${basePath}${path}`;
  }

  // Otherwise, append the path to the base path with a slash
  return `${basePath}/${path}`;
};

/**
 * Get the asset prefix for the application
 * This will be empty in development and the full GitHub Pages URL in production
 */
export const getAssetPrefix = (): string => {
  return process.env.NEXT_PUBLIC_ASSET_PREFIX || '';
};

/**
 * Prefix an asset path with the asset prefix
 * @param path The asset path to prefix
 * @returns The asset path with the asset prefix prefixed
 */
export const withAssetPrefix = (path: string): string => {
  const assetPrefix = getAssetPrefix();

  // For external links or data URLs, return as is
  if (path.startsWith('http') || path.startsWith('//') || path.startsWith('data:')) {
    return path;
  }

  // If no asset prefix or path already has the asset prefix, return as is
  if (!assetPrefix || path.startsWith(assetPrefix)) {
    return path;
  }

  // If the path starts with a slash, remove it and append to the asset prefix
  if (path.startsWith('/')) {
    return `${assetPrefix}${path.substring(1)}`;
  }

  // Otherwise, append the path to the asset prefix
  return `${assetPrefix}/${path}`;
};
