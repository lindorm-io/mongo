import lodash from "lodash";
import { MONGO_IN_MEMORY_DB } from "./MongoInMemoryClient";
import { MongoInMemoryCursor } from "./MongoInMemoryCursor";
import { TObject } from "@lindorm-io/core";

export class MongoInMemoryCollection {
  public databaseName: string;
  public collectionName: string;

  constructor(databaseName: string, collectionName: string) {
    this.databaseName = databaseName;
    this.collectionName = collectionName;

    if (!MONGO_IN_MEMORY_DB[this.databaseName][this.collectionName].indices) {
      MONGO_IN_MEMORY_DB[this.databaseName][this.collectionName].indices = [];
    }

    if (!MONGO_IN_MEMORY_DB[this.databaseName][this.collectionName].data) {
      MONGO_IN_MEMORY_DB[this.databaseName][this.collectionName].data = [];
    }
  }

  public async createIndex(index: TObject<any>, options: TObject<any>): Promise<any> {
    MONGO_IN_MEMORY_DB[this.databaseName][this.collectionName].indices.push({ index, options });

    return Promise.resolve();
  }

  public async insertOne(json: TObject<any>): Promise<any> {
    MONGO_IN_MEMORY_DB[this.databaseName][this.collectionName].data.push(json);

    return Promise.resolve({
      result: {
        ok: true,
      },
    });
  }

  public async findOneAndUpdate(filter: TObject<any>, options: TObject<any>): Promise<any> {
    const {
      version: { $eq },
      ...params
    } = filter;

    const query = { ...params, version: $eq };
    const item = lodash.find(MONGO_IN_MEMORY_DB[this.databaseName][this.collectionName].data, query);

    if (!item) {
      return Promise.resolve({
        ok: false,
        value: 0,
        lastErrorObject: {
          n: 0,
          updatedExisting: 0,
        },
      });
    }

    lodash.remove(MONGO_IN_MEMORY_DB[this.databaseName][this.collectionName].data, query);

    MONGO_IN_MEMORY_DB[this.databaseName][this.collectionName].data.push({ ...params, ...options.$set });

    return Promise.resolve({
      ok: true,
      value: 1,
      lastErrorObject: {
        n: 1,
        updatedExisting: 1,
      },
    });
  }

  public async findOne(filter: TObject<any>): Promise<any> {
    return Promise.resolve(lodash.find(MONGO_IN_MEMORY_DB[this.databaseName][this.collectionName].data, filter));
  }

  public async find(filter: TObject<any>): Promise<MongoInMemoryCursor> {
    return Promise.resolve(
      new MongoInMemoryCursor(lodash.filter(MONGO_IN_MEMORY_DB[this.databaseName][this.collectionName].data, filter)),
    );
  }

  public async findOneAndDelete(filter: TObject<any>): Promise<any> {
    lodash.remove(MONGO_IN_MEMORY_DB[this.databaseName][this.collectionName].data, filter);

    return Promise.resolve({
      ok: true,
    });
  }

  public async deleteMany(filter: TObject<any>): Promise<any> {
    const array = lodash.filter(MONGO_IN_MEMORY_DB[this.databaseName][this.collectionName].data, filter);

    lodash.remove(MONGO_IN_MEMORY_DB[this.databaseName][this.collectionName].data, filter);

    return Promise.resolve({
      result: {
        ok: true,
        n: array.length,
      },
    });
  }
}
