import { Event } from "../events/event";

export interface IEventStore {
  appendEvent<T>(event: Event<T>): Promise<void>;
  getLatestEvent<T>(aggregateId: string): Promise<Event<T> | null>;
}
