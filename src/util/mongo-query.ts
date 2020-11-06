import { IMongoConnectionOptions } from "../typing";
import { IRepositoryOptions } from "../repository";
import { Logger } from "@lindorm-io/winston";
import { MongoConnection } from "../class";

export type IDbQueryCallback = (options: IRepositoryOptions) => Promise<void>;

export interface IMongoQuery {
  mongoOptions: IMongoConnectionOptions;
  logger: Logger;
}

export const mongoQuery = async (options: IMongoQuery, callback: IDbQueryCallback): Promise<void> => {
  const mongo = new MongoConnection(options.mongoOptions);

  await mongo.connect();
  const db = await mongo.db();

  await callback({ db, logger: options.logger });

  await mongo.disconnect();
};

export const mongoPing = async (options: IMongoQuery): Promise<boolean> => {
  const mongo = new MongoConnection(options.mongoOptions);

  try {
    await mongo.connect();
    await mongo.disconnect();
    return true;
  } catch (_) {
    return false;
  }
};
