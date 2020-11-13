import { IMongoConnection, IMongoConnectionBaseOptions } from "../typing";
import { MongoConnectionBase } from "./MongoConnectionBase";
import { MongoInMemoryClient, MongoInMemoryDatabase } from "../class";
import { TObject } from "@lindorm-io/core";

export class MongoConnectionMemory extends MongoConnectionBase implements IMongoConnection {
  public client: MongoInMemoryClient;
  public database: MongoInMemoryDatabase;
  public inMemoryStore: TObject<any>;

  constructor(options: IMongoConnectionBaseOptions) {
    super(options);
    this.inMemoryStore = options.inMemoryStore;
  }

  public async connect(): Promise<void> {
    this.client = new MongoInMemoryClient(this.inMemoryStore);
    this.database = await this.client.db(this.databaseName);
  }

  public async disconnect(): Promise<void> {
    await this.client.close();
  }
}
