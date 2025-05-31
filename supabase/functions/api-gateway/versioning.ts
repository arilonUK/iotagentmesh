
export interface VersionConfig {
  version: string;
  handler: string;
  deprecated?: boolean;
  sunsetDate?: string;
  migrationGuide?: string;
}

export class ApiVersionManager {
  private versions: Map<string, VersionConfig> = new Map();
  private defaultVersion = 'v1';

  addVersion(config: VersionConfig) {
    this.versions.set(config.version, config);
  }

  setDefaultVersion(version: string) {
    this.defaultVersion = version;
  }

  extractVersion(req: Request): { version: string; path: string } {
    const url = new URL(req.url);
    let path = url.pathname;

    // Check for version in header first
    const headerVersion = req.headers.get('API-Version');
    if (headerVersion && this.versions.has(headerVersion)) {
      return { version: headerVersion, path };
    }

    // Check for version in URL path
    const versionMatch = path.match(/^\/api\/(v\d+)\//);
    if (versionMatch) {
      const version = versionMatch[1];
      if (this.versions.has(version)) {
        // Remove version from path
        path = path.replace(`/${version}`, '');
        return { version, path };
      }
    }

    // Check for version in query parameter
    const queryVersion = url.searchParams.get('version');
    if (queryVersion && this.versions.has(queryVersion)) {
      return { version: queryVersion, path };
    }

    // Return default version
    return { version: this.defaultVersion, path };
  }

  getVersionConfig(version: string): VersionConfig | undefined {
    return this.versions.get(version);
  }

  createVersionHeaders(version: string): Record<string, string> {
    const config = this.versions.get(version);
    const headers: Record<string, string> = {
      'API-Version': version,
    };

    if (config?.deprecated) {
      headers['Deprecation'] = 'true';
      if (config.sunsetDate) {
        headers['Sunset'] = config.sunsetDate;
      }
      if (config.migrationGuide) {
        headers['Link'] = `<${config.migrationGuide}>; rel="deprecation"`;
      }
    }

    return headers;
  }

  getAllVersions(): VersionConfig[] {
    return Array.from(this.versions.values());
  }
}

// Default version configurations
export const defaultVersions: VersionConfig[] = [
  {
    version: 'v1',
    handler: 'api-gateway',
  },
  {
    version: 'v2',
    handler: 'api-gateway-v2',
    deprecated: false,
  }
];
