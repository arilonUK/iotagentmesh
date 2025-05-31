
import React from 'react';
import { FileExplorerContainer } from './FileExplorerContainer';

interface FileExplorerProps {
  organizationId: string;
  initialPath?: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  organizationId,
  initialPath = ''
}) => {
  return (
    <FileExplorerContainer 
      organizationId={organizationId}
      initialPath={initialPath}
    />
  );
};

export default FileExplorer;
