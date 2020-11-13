import { Collection, Db, MongoClient } from "mongodb";
import { MongoConnectionType } from "../enum";
import { MongoInMemoryClient, MongoInMemoryCollection, MongoInMemoryDatabase } from "../class";
import { TObject } from "@lindorm-io/core";

export type TMongoClient = MongoClient | MongoInMemoryClient;
export type TMongoCollection = Collection | MongoInMemoryCollection;
export type TMongoDatabase = Db | MongoInMemoryDatabase;

export interface IMongoConnection {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getDatabase: () => TMongoDatabase;
}

export interface IMongoConnectionAuth {
  user: string;
  password: string;
}

export interface IMongoConnectionUrl {
  host: string;
  port: number;
}

export interface IMongoConnectionBaseOptions {
  auth: IMongoConnectionAuth;
  url: IMongoConnectionUrl;
  databaseName: string;
  inMemoryStore?: TObject<any>;
}

export interface IMongoConnectionOptions extends IMongoConnectionBaseOptions {
  type: MongoConnectionType;
}
