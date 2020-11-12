import { IMongoConnection, IMongoConnectionBaseOptions, TMongoClient, TMongoDatabase } from "../typing";

export interface IGetUrlOptions {
  user: string;
  password: string;
  host: string;
  port: number;
}

export abstract class MongoConnectionBase implements IMongoConnection {
  protected client: TMongoClient;
  protected database: TMongoDatabase;
  protected databaseName: string;
  protected url: string;

  protected constructor(options: IMongoConnectionBaseOptions) {
    this.databaseName = options.databaseName;
    this.url = this.getUrl({
      user: options.auth.user,
      password: options.auth.password,
      host: options.url.host,
      port: options.url.port,
    });
  }

  protected getUrl(options: IGetUrlOptions): string {
    const { user, password, host, port } = options;
    return `mongodb://${user}:${password}@${host}:${port}/`;
  }

  public abstract async connect(): Promise<void>;

  public abstract async disconnect(): Promise<void>;

  public getDatabase(): TMongoDatabase {
    if (!this.database) {
      throw new Error("You must connect() before you can call getDatabase()");
    }
    return this.database;
  }
}
