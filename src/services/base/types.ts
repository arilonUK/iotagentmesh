
export interface QueryParams {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface ServiceResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

export interface DomainService<T, CreateDTO, UpdateDTO> {
  fetchAll(params?: QueryParams): Promise<T[]>;
  fetchById(id: string): Promise<T | null>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<boolean>;
}

export interface ServiceLifecycle {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  isInitialized(): boolean;
}

export interface ServiceDependencies {
  [key: string]: unknown;
}
