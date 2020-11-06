import lodash from "lodash";
import { TObject } from "@lindorm-io/core";
import { IMongoConnectionOptions } from "../typing";

export class MongoInMemoryCursor {
  public data: Array<TObject<any>>;

  constructor(data: Array<TObject<any>>) {
    this.data = data;
  }

  public toArray(): Promise<Array<TObject<any>>> {
    return Promise.resolve(this.data);
  }
}

export class MongoInMemoryCollection {
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

  public find(filter: TObject<any>): Promise<MongoInMemoryCursor> {
    return Promise.resolve(new MongoInMemoryCursor(lodash.filter(this.data, filter)));
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

export class MongoInMemoryDatabase {
  public collections: TObject<MongoInMemoryCollection>;
  public databaseName: string;

  constructor(name: string) {
    this.collections = {};
    this.databaseName = name;
  }

  public collection(name: string): Promise<MongoInMemoryCollection> {
    if (!this.collections[name]) {
      this.collections[name] = new MongoInMemoryCollection();
    }
    return Promise.resolve(this.collections[name]);
  }
}

export class MongoInMemoryClient {
  public databases: TObject<MongoInMemoryDatabase>;

  constructor() {
    this.databases = {};
  }

  public db(name: string): Promise<MongoInMemoryDatabase> {
    if (!this.databases[name]) {
      this.databases[name] = new MongoInMemoryDatabase(name);
    }
    return Promise.resolve(this.databases[name]);
  }

  public close(): Promise<void> {
    this.databases = {};
    return Promise.resolve();
  }
}

export class MongoInMemoryConnection {
  public options: IMongoConnectionOptions;
  public client: MongoInMemoryClient;
  public database: MongoInMemoryDatabase;

  constructor(options: IMongoConnectionOptions) {
    this.options = options;
  }

  public async connect(): Promise<void> {
    this.client = new MongoInMemoryClient();
    this.database = await this.client.db(this.options.name);
  }

  public db(): MongoInMemoryDatabase {
    if (!this.database) {
      throw new Error("You must connect() before you can get db()");
    }
    return this.database;
  }

  public async disconnect(): Promise<void> {
    await this.client.close();
  }
}
