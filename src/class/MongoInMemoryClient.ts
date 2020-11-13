import { MongoInMemoryDatabase } from "./MongoInMemoryDatabase";
import { TObject } from "@lindorm-io/core";

export class MongoInMemoryClient {
  public store: TObject<MongoInMemoryDatabase>;

  constructor(store?: TObject<any>) {
    this.store = store || {};
  }

  public async db(databaseName: string): Promise<MongoInMemoryDatabase> {
    if (!this.store[databaseName]) {
      this.store[databaseName] = new MongoInMemoryDatabase(databaseName);
    }

    return this.store[databaseName];
  }

  public async close(): Promise<void> {
    return Promise.resolve();
  }
}
