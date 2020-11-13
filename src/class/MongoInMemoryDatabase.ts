import { MONGO_IN_MEMORY_DB } from "./MongoInMemoryClient";
import { MongoInMemoryCollection } from "./MongoInMemoryCollection";
import { TObject } from "@lindorm-io/core";

export class MongoInMemoryDatabase {
  public collections: TObject<MongoInMemoryCollection>;
  public databaseName: string;

  constructor(databaseName: string) {
    this.collections = {};
    this.databaseName = databaseName;
  }

  public async collection(collectionName: string): Promise<MongoInMemoryCollection> {
    if (!this.collections[collectionName]) {
      MONGO_IN_MEMORY_DB[this.databaseName][collectionName] = {};
    }

    this.collections[collectionName] = new MongoInMemoryCollection(this.databaseName, collectionName);

    return Promise.resolve(this.collections[collectionName]);
  }
}
