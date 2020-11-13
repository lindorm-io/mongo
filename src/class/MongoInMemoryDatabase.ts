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
      this.collections[collectionName] = new MongoInMemoryCollection(collectionName);
    }

    return Promise.resolve(this.collections[collectionName]);
  }
}
