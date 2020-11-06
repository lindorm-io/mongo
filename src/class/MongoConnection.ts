import { Db, MongoClient } from "mongodb";
import { IMongoConnectionOptions } from "../typing";

export class MongoConnection {
  private options: IMongoConnectionOptions;
  private client: MongoClient;
  private database: Db;

  constructor(options: IMongoConnectionOptions) {
    this.options = options;
  }

  private getUrl(): string {
    const { user, password, host, port } = this.options;
    return `mongodb://${user}:${password}@${host}:${port}/`;
  }

  public async connect(): Promise<void> {
    this.client = await MongoClient.connect(this.getUrl(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.database = await this.client.db(this.options.name);
  }

  public db(): Db {
    if (!this.database) {
      throw new Error("You must connect() before you can get db()");
    }
    return this.database;
  }

  public async disconnect(): Promise<void> {
    await this.client.close();
  }
}
