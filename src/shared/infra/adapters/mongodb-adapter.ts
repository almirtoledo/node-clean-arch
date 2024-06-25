import { Event } from "@/shared/domain/events/event";
import { IEventStore } from "@/shared/domain/repositories/i-event-store";
import { Collection, Db, MongoClient } from "mongodb";

export class MongoEventStore implements IEventStore {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private readonly collectionName = "events";

  constructor() {
    this.connectToDatabase().catch(console.error);
  }

  private async connectToDatabase(): Promise<void> {
    if (!this.client || !this.db) {
      this.client = new MongoClient(process.env.MONGODB_URI!);
      await this.client.connect();
      this.db = this.client.db(process.env.MONGODB_DB_NAME);
    }
  }

  private async getCollection(): Promise<Collection> {
    if (!this.db) {
      await this.connectToDatabase();
    }

    if (!this.db) {
      throw new Error("Database connection failed");
    }

    return this.db.collection(this.collectionName);
  }

  async appendEvent<T>(event: Event<T>): Promise<void> {
    try {
      const collection = await this.getCollection();
      await collection.insertOne({
        aggregateId: event.aggregateId,
        type: event.type,
        data: event.data,
        timestamp: event.timestamp,
      });
    } finally {
      await this.disconnectFromDatabase();
    }
  }

  async getLatestEvent<T>(aggregateId: string): Promise<Event<T> | null> {
    try {
      const collection = await this.getCollection();
      const result = await collection.findOne(
        { aggregateId },
        { sort: { timestamp: -1 } }
      );

      if (!result) {
        return null;
      }

      return new Event(
        result.aggregateId,
        result.type,
        result.data,
        result.timestamp
      );
    } finally {
      await this.disconnectFromDatabase();
    }
  }

  private async disconnectFromDatabase(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}
