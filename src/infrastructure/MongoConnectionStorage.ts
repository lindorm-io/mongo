import { Db, MongoClient } from "mongodb";
import { IMongoConnection, IMongoConnectionBaseOptions } from "../typing";
import { MongoConnectionBase } from "./MongoConnectionBase";

export class MongoConnectionStorage extends MongoConnectionBase implements IMongoConnection {
  protected client: MongoClient;
  protected database: Db;

  constructor(options: IMongoConnectionBaseOptions) {
    super(options);
  }

  public async connect(): Promise<void> {
    this.client = await MongoClient.connect(this.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.database = await this.client.db(this.databaseName);
  }

  public async disconnect(): Promise<void> {
    await this.client.close();
  }
}
