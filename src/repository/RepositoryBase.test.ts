import Joi from "@hapi/joi";
import MockDate from "mockdate";
import { EntityBase, TObject } from "@lindorm-io/core";
import { IRepositoryOptions, RepositoryBase } from "./RepositoryBase";
import { Logger, LogLevel } from "@lindorm-io/winston";
import { MongoConnection } from "../infrastructure";
import { MongoConnectionType } from "../enum";
import { TMongoDatabase } from "../typing";

jest.mock("uuid", () => ({
  v4: () => "e397bc49-849e-4df6-a536-7b9fa3574ace",
}));

MockDate.set("2020-01-01 08:00:00.000");

class MockEntity extends EntityBase {
  public name: string;
  public hasCreatedFunctionBeenCalled: boolean;

  constructor(options: any) {
    super(options);
    this.name = options.name;
    this.hasCreatedFunctionBeenCalled = options.hasCreatedFunctionBeenCalled;
  }

  create() {
    this.hasCreatedFunctionBeenCalled = true;
  }
}

class MockRepository extends RepositoryBase<MockEntity> {
  constructor(options: IRepositoryOptions) {
    super({
      collectionName: "MockRepository",
      db: options.db,
      logger: options.logger,
      indices: [{ index: { id: 1 }, options: { unique: true } }],
      schema: Joi.object({
        created: Joi.date().required(),
        id: Joi.string().guid().required(),
        name: Joi.string().required(),
        updated: Joi.date().required(),
        version: Joi.number().required(),
      }),
    });
  }

  protected createEntity(data: any): MockEntity {
    return new MockEntity(data);
  }

  protected getEntityJSON(entity: MockEntity): any {
    return {
      created: entity.created,
      id: entity.id,
      name: entity.name,
      updated: entity.updated,
      version: entity.version,
    };
  }
}

const logger = new Logger({ packageName: "n", packageVersion: "v" });
logger.addConsole(LogLevel.ERROR);

describe("RepositoryBase.ts", () => {
  let inMemoryStore: TObject<any>;
  let mongo: MongoConnection;
  let repository: MockRepository;
  let db: TMongoDatabase;

  beforeEach(async () => {
    inMemoryStore = { initialized: true };

    mongo = new MongoConnection({
      type: MongoConnectionType.MEMORY,
      auth: {
        user: "user",
        password: "password",
      },
      url: {
        host: "host",
        port: 999,
      },
      databaseName: "databaseName",
      inMemoryStore,
    });

    await mongo.connect();
    db = mongo.getDatabase();

    repository = new MockRepository({ db, logger });
  });

  test("should run setup on any method", async () => {
    await repository.create(new MockEntity({ name: "mock" }));

    expect(inMemoryStore).toMatchSnapshot();
  });

  test("should create entity", async () => {
    const e1 = new MockEntity({ name: "e1" });
    const created = await repository.create(e1);

    expect(created).toMatchSnapshot();
    expect(inMemoryStore).toMatchSnapshot();
  });

  test("should update entity", async () => {
    const e1 = new MockEntity({ name: "e1" });
    const created = await repository.create(e1);

    created.name = "changed";

    const updated = await repository.update(created);

    expect(updated).toMatchSnapshot();
    expect(inMemoryStore).toMatchSnapshot();
  });

  test("should find entity", async () => {
    const e1 = new MockEntity({ name: "e1" });
    await repository.create(e1);

    const found = await repository.find({ name: "e1" });

    expect(found).toMatchSnapshot();
    expect(inMemoryStore).toMatchSnapshot();
  });

  test("should find many entities", async () => {
    const e1 = new MockEntity({ name: "ex" });
    const e2 = new MockEntity({ name: "ex" });

    await repository.create(e1);
    await repository.create(e2);

    const found = await repository.findMany({ name: "ex" });

    expect(found).toMatchSnapshot();
    expect(inMemoryStore).toMatchSnapshot();
  });

  test("should find an entity and not create", async () => {
    const e1 = new MockEntity({ name: "found-and-exists" });
    await repository.create(e1);

    const found = await repository.findOrCreate({ id: e1.id });

    expect(found).toMatchSnapshot();
    expect(inMemoryStore).toMatchSnapshot();
  });

  test("should create entity when not found", async () => {
    const created = await repository.findOrCreate({ id: "86ca6243-4813-42f5-9829-582b6303c10a", name: "new-entity" });

    expect(created).toMatchSnapshot();
    expect(inMemoryStore).toMatchSnapshot();
  });

  test("should remove one entity", async () => {
    const e1 = new MockEntity({ name: "e1" });
    const e2 = new MockEntity({ name: "e2" });

    await repository.create(e1);
    await repository.create(e2);

    await repository.remove(e1);

    await expect(repository.findMany({})).resolves.toMatchSnapshot();
    expect(inMemoryStore).toMatchSnapshot();
  });

  test("should remove many entities", async () => {
    const e1 = new MockEntity({ name: "ex" });
    const e2 = new MockEntity({ name: "ex" });
    const e3 = new MockEntity({ name: "e3" });

    await repository.create(e1);
    await repository.create(e2);
    await repository.create(e3);

    await repository.removeMany({ name: "ex" });

    await expect(repository.findMany({})).resolves.toMatchSnapshot();
    expect(inMemoryStore).toMatchSnapshot();
  });
});
