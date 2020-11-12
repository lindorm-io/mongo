import { IMongoConnection, IMongoConnectionOptions, TMongoDatabase } from "../typing";
import { MongoConnectionBase } from "./MongoConnectionBase";
import { MongoConnectionStorage } from "./MongoConnectionStorage";
import { MongoConnectionMemory } from "./MongoConnectionMemory";
import { MongoConnectionType } from "../enum";

export class MongoConnection implements IMongoConnection {
  private connection: MongoConnectionBase;

  constructor(options: IMongoConnectionOptions) {
    switch (options.type) {
      case MongoConnectionType.STORAGE:
        this.connection = new MongoConnectionStorage(options);
        break;

      case MongoConnectionType.MEMORY:
        this.connection = new MongoConnectionMemory(options);
        break;

      default:
        throw new Error(`Unknown connection type: [ ${options.type} ]`);
    }
  }

  public async connect(): Promise<void> {
    return this.connection.connect();
  }

  public async disconnect(): Promise<void> {
    return this.connection.disconnect();
  }

  public getDatabase(): TMongoDatabase {
    return this.connection.getDatabase();
  }
}
