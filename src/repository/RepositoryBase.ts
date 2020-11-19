import Joi from "@hapi/joi";
import { EntityCreationError, IEntity, TObject, TPromise } from "@lindorm-io/core";
import { Logger } from "@lindorm-io/winston";
import { RepositoryEntityNotFoundError, RepositoryEntityNotUpdatedError } from "../error";
import { TMongoCollection, TMongoDatabase } from "../typing";

export interface IRepository<Entity> {
  create(entity: Entity): Promise<Entity>;
  update(entity: Entity): Promise<Entity>;
  find(filter: TObject<any>): Promise<Entity>;
  findMany(filter: TObject<any>): Promise<Array<Entity>>;
  findOrCreate(filter: TObject<any>): Promise<Entity>;
  remove(entity: Entity): Promise<void>;
  removeMany(filter: TObject<any>): Promise<void>;
}

export interface IRepositoryOptions {
  db: TMongoDatabase;
  logger: Logger;
}

export interface IRepositoryBaseOptions extends IRepositoryOptions {
  collectionName: string;
  indices: Array<IIndex>;
  schema: Joi.Schema;
}

export interface IIndex {
  index: TObject<number>;
  options: {
    unique: boolean;
  };
}

export abstract class RepositoryBase<Entity extends IEntity> implements IRepository<Entity> {
  private collectionName: string;
  private collection: TMongoCollection;
  private db: TMongoDatabase;
  private indices: Array<IIndex>;
  protected logger: Logger;
  private promise: TPromise<void>;
  private schema: Joi.Schema;

  protected constructor(options: IRepositoryBaseOptions) {
    this.collectionName = options.collectionName;
    this.db = options.db;
    this.indices = options.indices;
    this.schema = options.schema;

    this.logger = options.logger.createChildLogger([
      "mongo",
      this.db.databaseName.toLowerCase(),
      this.collectionName.toLowerCase(),
    ]);
    this.promise = this.setup;
  }

  private async setup(): Promise<void> {
    const start = Date.now();
    this.collection = await this.db.collection(this.collectionName);

    for (const { index, options } of this.indices) {
      await this.collection.createIndex(index, options);
    }

    this.logger.debug("setup", {
      result: { success: true },
      time: Date.now() - start,
    });

    this.promise = () => Promise.resolve(undefined);
  }

  protected abstract createEntity(data: IEntity): Entity;

  protected abstract getEntityJSON(entity: Entity): IEntity;

  async create(entity: Entity): Promise<Entity> {
    const start = Date.now();

    try {
      entity.create();
    } catch (err) {
      if (!(err instanceof EntityCreationError)) {
        throw err;
      }
    }

    const json = this.getEntityJSON(entity);

    await this.schema.validateAsync(json);
    await this.promise();

    const result = await this.collection.insertOne(json);

    this.logger.debug("insertOne", {
      payload: Object.keys(json),
      result: { success: !!result.result.ok },
      time: Date.now() - start,
    });

    return entity;
  }

  async update(entity: Entity): Promise<Entity> {
    const start = Date.now();

    const currentVersion = entity.version;

    entity.updated = new Date();
    entity.version = currentVersion + 1;

    const json = this.getEntityJSON(entity);
    const { id, ...payload } = json;
    const filter = {
      id,
      version: { $eq: currentVersion },
    };

    await this.schema.validateAsync(json);
    await this.promise();

    const result = await this.collection.findOneAndUpdate(filter, { $set: payload });
    const success =
      result.ok && result.value && result.lastErrorObject?.n === 1 && result.lastErrorObject?.updatedExisting;

    this.logger.debug("findOneAndUpdate", {
      filter: Object.keys({ id }),
      payload: Object.keys(payload),
      result: { success },
      time: Date.now() - start,
    });

    if (!success) {
      throw new RepositoryEntityNotUpdatedError(filter, result);
    }

    return entity;
  }

  async find(filter: TObject<any>): Promise<Entity> {
    const start = Date.now();

    await this.promise();

    const result = await this.collection.findOne(filter);

    this.logger.debug("findOne", {
      filter: Object.keys(filter),
      result: { success: !!result },
      time: Date.now() - start,
    });

    if (!result) {
      throw new RepositoryEntityNotFoundError(filter, result);
    }

    return this.createEntity(result);
  }

  async findMany(filter: TObject<any> = {}): Promise<Array<Entity>> {
    const start = Date.now();

    await this.promise();

    const cursor = await this.collection.find(filter);
    const results = await cursor.toArray();

    this.logger.debug("find", {
      filter: Object.keys(filter),
      result: { success: !!results.length, amount: results.length },
      time: Date.now() - start,
    });

    const entities: Array<Entity> = [];

    for (const item of results) {
      entities.push(this.createEntity(item));
    }

    return entities;
  }

  async findOrCreate(filter: TObject<any>): Promise<Entity> {
    try {
      return await this.find(filter);
    } catch (err) {
      if (err instanceof RepositoryEntityNotFoundError) {
        return await this.create(this.createEntity(filter as IEntity));
      }
      throw err;
    }
  }

  async remove(entity: Entity): Promise<void> {
    const start = Date.now();

    const { id } = this.getEntityJSON(entity);

    await this.promise();

    const result = await this.collection.findOneAndDelete({ id });

    this.logger.debug("findOneAndDelete", {
      filter: Object.keys({ id }),
      result: { success: !!result.ok },
      time: Date.now() - start,
    });
  }

  async removeMany(filter: TObject<any>): Promise<void> {
    const start = Date.now();

    await this.promise();

    const result = await this.collection.deleteMany(filter);

    this.logger.debug("deleteMany", {
      filter: Object.keys(filter),
      result: { success: !!result.result.ok, amount: result.result.n },
      time: Date.now() - start,
    });
  }
}
