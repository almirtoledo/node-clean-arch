export class Event<T> {
  constructor(
    public readonly aggregateId: string,
    public readonly type: string,
    public readonly data: T,
    public readonly timestamp: Date = new Date()
  ) {}
}
