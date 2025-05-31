
import { useState } from 'react';

export const useFileNavigation = (initialPath: string = '') => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [searchQuery, setSearchQuery] = useState('');

  const navigateToFolder = (folderName: string) => {
    setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
  };

  const navigateUp = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  return {
    currentPath,
    searchQuery,
    setSearchQuery,
    navigateToFolder,
    navigateUp
  };
};
