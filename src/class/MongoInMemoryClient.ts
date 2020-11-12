import { MongoInMemoryDatabase } from "./MongoInMemoryDatabase";
import { TObject } from "@lindorm-io/core";

export class MongoInMemoryClient {
  public databases: TObject<MongoInMemoryDatabase>;

  constructor() {
    this.databases = {};
  }

  public async db(name: string): Promise<MongoInMemoryDatabase> {
    if (!this.databases[name]) {
      this.databases[name] = new MongoInMemoryDatabase(name);
    }
    return this.databases[name];
  }

  public async close(): Promise<void> {
    this.databases = {};
    return Promise.resolve();
  }
}
