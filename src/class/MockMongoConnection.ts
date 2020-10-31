import lodash from "lodash";
import { TObject } from "@lindorm-io/core";

export class MockMongoCursor {
  private _logger: any;
  public data: Array<TObject<any>>;

  constructor(logger: any, data: Array<TObject<any>>) {
    this._logger = logger;
    this.data = data;
  }

  public toArray(): Promise<Array<TObject<any>>> {
    this._logger.log("MockMongoCursor.toArray()");

    return Promise.resolve(this.data);
  }
}

export class MockMongoCollection {
  private _logger: any;
  public data: Array<TObject<any>>;
  public indices: Array<TObject<any>>;

  constructor(logger: any) {
    this._logger = logger;
    this.indices = [];
    this.data = [];
  }

  public createIndex(index: TObject<any>, options: TObject<any>): Promise<any> {
    this._logger.log("MockMongoCollection.createIndex()", { index, options });

    this.indices.push({ index, options });

    return Promise.resolve();
  }

  public insertOne(json: TObject<any>): Promise<any> {
    this._logger.log("MockMongoCollection.insertOne()", { json });

    this.data.push(json);

    return Promise.resolve({
      result: {
        ok: true,
      },
    });
  }

  public findOneAndUpdate(filter: TObject<any>, options: TObject<any>): Promise<any> {
    this._logger.log("MockMongoCollection.findOneAndUpdate()", { filter, options });

    const {
      version: { $eq },
      ...params
    } = filter;

    const query = { ...params, version: $eq };

    const item = lodash.find(this.data, query);

    if (!item) throw new Error("item not found");

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
    this._logger.log("MockMongoCollection.findOne()", { filter });

    return Promise.resolve(lodash.find(this.data, filter));
  }

  public find(filter: TObject<any>): Promise<MockMongoCursor> {
    this._logger.log("MockMongoCollection.find()", { filter });

    return Promise.resolve(new MockMongoCursor(this._logger, lodash.filter(this.data, filter)));
  }

  public findOneAndDelete(filter: TObject<any>): Promise<any> {
    this._logger.log("MockMongoCollection.findOneAndDelete()", { filter });

    lodash.remove(this.data, filter);

    return Promise.resolve({
      ok: true,
    });
  }

  public deleteMany(filter: TObject<any>): Promise<any> {
    this._logger.log("MockMongoCollection.deleteMany()", { filter });

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
  private _logger: any;
  public collections: TObject<MockMongoCollection>;
  public databaseName: string;

  constructor(logger: any, name: string) {
    this._logger = logger;
    this.collections = {};
    this.databaseName = name;
  }

  public collection(name: string): Promise<MockMongoCollection> {
    this._logger.log("MockMongoDatabase.collection()", { name });

    if (!this.collections[name]) {
      this.collections[name] = new MockMongoCollection(this._logger);
    }

    return Promise.resolve(this.collections[name]);
  }
}

export class MockMongoClient {
  private _logger: any;
  public databases: TObject<MockMongoDatabase>;

  constructor(logger: any) {
    this._logger = logger;
    this.databases = {};
  }

  public db(name: string): Promise<MockMongoDatabase> {
    this._logger.log("MockMongoClient.db()", { name });

    if (!this.databases[name]) {
      this.databases[name] = new MockMongoDatabase(this._logger, name);
    }

    return Promise.resolve(this.databases[name]);
  }

  public close(): Promise<void> {
    this._logger.log("MockMongoClient.close()");

    return Promise.resolve();
  }
}

export class MockMongo {
  private _logger: any;
  public client: MockMongoClient;

  constructor(logger: any) {
    this._logger = logger;
    this.client = new MockMongoClient(logger);
  }

  public connect(url: string, options: TObject<any>): Promise<MockMongoClient> {
    this._logger.log("MockMongo.connect()", { url, options });

    return Promise.resolve(this.client);
  }
}
