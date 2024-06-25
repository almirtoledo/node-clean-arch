import { ORM, PaginationResult } from "@/shared/domain/contracts/orm";
import mariadb, { Pool, PoolConnection } from "mariadb";

export class MariaDBAdapter implements ORM {
  private pool: Pool;

  constructor() {
    this.pool = mariadb.createPool({
      host: process.env.MARIADB_HOST,
      user: process.env.MARIADB_USER,
      password: process.env.MARIADB_PASSWORD,
      database: process.env.MARIADB_NAME,
      port: Number(process.env.MARIADB_PORT),
      connectionLimit: 10,
    });
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    let conn: PoolConnection | undefined;
    try {
      conn = await this.pool.getConnection();
      const result = await conn.query(sql, params);
      return result;
    } catch (err) {
      throw err;
    } finally {
      if (conn) await conn.release();
    }
  }

  async insert(tableName: string, data: Record<string, any>): Promise<void> {
    const keys = Object.keys(data).filter((key) => data[key] !== undefined);
    const values = keys.map((key) => data[key]);
    const sql = `INSERT INTO \`${tableName}\` (${keys
      .map((key) => `\`${key}\``)
      .join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`;
    await this.query(sql, values);
  }

  async select<T>({
    tableName,
    columns = "*",
    whereClause = "",
    params = [],
  }: {
    tableName: string;
    columns?: string[] | string;
    whereClause?: string;
    params?: any[];
  }): Promise<T[]> {
    const where = whereClause ? ` WHERE ${whereClause}` : "";
    const sql = `SELECT ${
      Array.isArray(columns)
        ? columns.map((col) => `\`${col}\``).join(", ")
        : columns
    } FROM \`${tableName}\`${where}`;
    return await this.query(sql, params);
  }

  async count({
    tableName,
    whereClause = "",
    params = [],
  }: {
    tableName: string;
    whereClause?: string;
    params?: any[];
  }): Promise<number> {
    const where = whereClause ? ` WHERE ${whereClause}` : "";
    const sql = `SELECT COUNT(*) as count FROM \`${tableName}\`${where}`;
    const result = await this.query(sql, params);
    return Number(result[0].count);
  }

  async paginate<T>({
    tableName,
    columns = "*",
    page = 1,
    pageSize = 25,
    whereClause = "",
    params = [],
  }: {
    tableName: string;
    columns?: string[] | string;
    page?: number;
    pageSize?: number;
    whereClause?: string;
    params?: any[];
  }): Promise<PaginationResult<T>> {
    const offset = (page - 1) * pageSize;
    const where = whereClause ? ` WHERE ${whereClause}` : "";
    const sql = `SELECT ${
      Array.isArray(columns)
        ? columns.map((col) => `\`${col}\``).join(", ")
        : columns
    } FROM \`${tableName}\`${where} LIMIT ? OFFSET ?`;

    const data: T[] = await this.query(sql, [...params, pageSize, offset]);
    const totalResults = await this.count({ tableName, whereClause, params });

    return {
      totalResults,
      totalPages: Math.ceil(Number(totalResults) / pageSize),
      currentPage: page,
      pageSize,
      data,
    };
  }

  async update<T>(tableName: string, data: T): Promise<void> {
    const { id, ...updateFields } = data as any;

    if (!id) {
      throw new Error("The 'id' field is required for update operations.");
    }

    const keys = Object.keys(updateFields).filter(
      (key) => updateFields[key] !== undefined
    );
    const values = keys.map((key) => updateFields[key]);

    if (keys.length === 0) {
      throw new Error("No fields to update.");
    }

    const setClause = keys.map((key) => `\`${key}\` = ?`).join(", ");
    const sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE \`id\` = ?`;

    await this.query(sql, [...values, id]);
  }

  closePool(): void {
    this.pool.end();
  }
}
