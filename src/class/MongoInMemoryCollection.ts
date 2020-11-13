import lodash from "lodash";
import { MongoInMemoryCursor } from "./MongoInMemoryCursor";
import { TObject } from "@lindorm-io/core";

export class MongoInMemoryCollection {
  public databaseName: string;
  public collectionName: string;
  public indices: Array<any>;
  public data: Array<any>;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.indices = [];
    this.data = [];
  }

  public async createIndex(index: TObject<any>, options: TObject<any>): Promise<any> {
    this.indices.push({ index, options });

    return Promise.resolve();
  }

  public async insertOne(json: TObject<any>): Promise<any> {
    this.data.push(json);

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
    const item = lodash.find(this.data, query);

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

    lodash.remove(this.data, query);

    this.data.push({ ...params, ...options.$set });

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
    return Promise.resolve(lodash.find(this.data, filter));
  }

  public async find(filter: TObject<any>): Promise<MongoInMemoryCursor> {
    return Promise.resolve(new MongoInMemoryCursor(lodash.filter(this.data, filter)));
  }

  public async findOneAndDelete(filter: TObject<any>): Promise<any> {
    lodash.remove(this.data, filter);

    return Promise.resolve({
      ok: true,
    });
  }

  public async deleteMany(filter: TObject<any>): Promise<any> {
    const array = lodash.filter(this.data, filter);

    lodash.remove(this.data, filter);

    return Promise.resolve({
      result: {
        ok: true,
        n: array.length,
      },
    });
  }
}
