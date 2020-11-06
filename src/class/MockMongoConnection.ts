import lodash from "lodash";
import { TObject } from "@lindorm-io/core";
import { IMongoConnectionOptions } from "./MongoConnection";

export class MockMongoCursor {
  public data: Array<TObject<any>>;

  constructor(data: Array<TObject<any>>) {
    this.data = data;
  }

  public toArray(): Promise<Array<TObject<any>>> {
    return Promise.resolve(this.data);
  }
}

export class MockMongoCollection {
  public data: Array<TObject<any>>;
  public indices: Array<TObject<any>>;

  constructor() {
    this.indices = [];
    this.data = [];
  }

  public createIndex(index: TObject<any>, options: TObject<any>): Promise<any> {
    this.indices.push({ index, options });
    return Promise.resolve();
  }

  public insertOne(json: TObject<any>): Promise<any> {
    this.data.push(json);
    return Promise.resolve({
      result: {
        ok: true,
      },
    });
  }

  public findOneAndUpdate(filter: TObject<any>, options: TObject<any>): Promise<any> {
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

  public findOne(filter: TObject<any>): Promise<any> {
    return Promise.resolve(lodash.find(this.data, filter));
  }

  public find(filter: TObject<any>): Promise<MockMongoCursor> {
    return Promise.resolve(new MockMongoCursor(lodash.filter(this.data, filter)));
  }

  public findOneAndDelete(filter: TObject<any>): Promise<any> {
    lodash.remove(this.data, filter);
    return Promise.resolve({
      ok: true,
    });
  }

  public deleteMany(filter: TObject<any>): Promise<any> {
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

export class MockMongoDatabase {
  public collections: TObject<MockMongoCollection>;
  public databaseName: string;

  constructor(name: string) {
    this.collections = {};
    this.databaseName = name;
  }

  public collection(name: string): Promise<MockMongoCollection> {
    if (!this.collections[name]) {
      this.collections[name] = new MockMongoCollection();
    }
    return Promise.resolve(this.collections[name]);
  }
}

export class MockMongoClient {
  public databases: TObject<MockMongoDatabase>;

  constructor() {
    this.databases = {};
  }

  public db(name: string): Promise<MockMongoDatabase> {
    if (!this.databases[name]) {
      this.databases[name] = new MockMongoDatabase(name);
    }
    return Promise.resolve(this.databases[name]);
  }

  public close(): Promise<void> {
    return Promise.resolve();
  }
}

export class MockMongo {
  public client: MockMongoClient;

  constructor(_: IMongoConnectionOptions) {
    this.client = new MockMongoClient();
  }

  public connect(): Promise<MockMongoClient> {
    return Promise.resolve(this.client);
  }
}
