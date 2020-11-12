import { MongoInMemoryCollection } from "./MongoInMemoryCollection";
import { TObject } from "@lindorm-io/core";

export class MongoInMemoryDatabase {
  public collections: TObject<MongoInMemoryCollection>;
  public databaseName: string;

  constructor(name: string) {
    this.collections = {};
    this.databaseName = name;
  }

  public async collection(name: string): Promise<MongoInMemoryCollection> {
    if (!this.collections[name]) {
      this.collections[name] = new MongoInMemoryCollection();
    }
    return Promise.resolve(this.collections[name]);
  }
}
