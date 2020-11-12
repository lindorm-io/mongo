import { IMongoConnection, IMongoConnectionBaseOptions } from "../typing";
import { MongoConnectionBase } from "./MongoConnectionBase";
import { MongoInMemoryClient, MongoInMemoryDatabase } from "../class";

export class MongoConnectionMemory extends MongoConnectionBase implements IMongoConnection {
  public client: MongoInMemoryClient;
  public database: MongoInMemoryDatabase;

  constructor(options: IMongoConnectionBaseOptions) {
    super(options);
  }

  public async connect(): Promise<void> {
    this.client = new MongoInMemoryClient();
    this.database = await this.client.db(this.databaseName);
  }

  public async disconnect(): Promise<void> {
    await this.client.close();
  }
}
