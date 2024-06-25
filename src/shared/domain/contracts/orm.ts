export type PaginationResult<T> = {
  totalResults: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  data: T[];
};

export interface ORM {
  query(sql: string, params: any[]): Promise<any>;

  insert(tableName: string, data: Record<string, any>): Promise<void>;

  select<T>(props: {
    tableName: string;
    columns?: string[] | string;
    whereClause?: string;
    params?: any[];
  }): Promise<T[]>;

  count(props: {
    tableName: string;
    whereClause?: string;
    params?: any[];
  }): Promise<number>;

  paginate<T>(props: {
    tableName: string;
    columns?: string[] | string;
    page?: number;
    pageSize?: number;
    whereClause?: string;
    params?: any[];
  }): Promise<PaginationResult<T>>;

  update<T>(tableName: string, data: T): Promise<void>;

  closePool(): void;
}
