import { MongoInMemoryDatabase } from "./MongoInMemoryDatabase";
import { TObject } from "@lindorm-io/core";

export const MONGO_IN_MEMORY_DB: TObject<any> = {};

export class MongoInMemoryClient {
  public databases: TObject<MongoInMemoryDatabase>;

  constructor() {
    this.databases = {};
  }

  public async db(databaseName: string): Promise<MongoInMemoryDatabase> {
    if (!this.databases[databaseName]) {
      MONGO_IN_MEMORY_DB[databaseName] = {};
    }

    this.databases[databaseName] = new MongoInMemoryDatabase(databaseName);

    return this.databases[databaseName];
  }

  public async close(): Promise<void> {
    this.databases = {};
    return Promise.resolve();
  }
}
