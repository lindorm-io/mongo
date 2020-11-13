import { MongoInMemoryCollection } from "./MongoInMemoryCollection";
import { TObject } from "@lindorm-io/core";

export class MongoInMemoryDatabase {
  public database: TObject<any>;
  public databaseName: string;

  constructor(database: TObject<any>, databaseName: string) {
    this.database = database;
    this.databaseName = databaseName;
  }

  public async collection(collectionName: string): Promise<MongoInMemoryCollection> {
    if (!this.database[collectionName]) {
      this.database[collectionName] = {};
    }

    return Promise.resolve(new MongoInMemoryCollection(this.database[collectionName]));
  }
}
