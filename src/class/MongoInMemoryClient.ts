import { MongoInMemoryDatabase } from "./MongoInMemoryDatabase";
import { TObject } from "@lindorm-io/core";

export class MongoInMemoryClient {
  public store: TObject<any>;

  constructor(store?: TObject<any>) {
    this.store = store || {};
  }

  public async db(databaseName: string): Promise<MongoInMemoryDatabase> {
    if (!this.store[databaseName]) {
      this.store[databaseName] = {};
    }

    return Promise.resolve(new MongoInMemoryDatabase(this.store[databaseName], databaseName));
  }

  public async close(): Promise<void> {
    return Promise.resolve();
  }
}
