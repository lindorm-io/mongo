import Joi from "@hapi/joi";
import { IRepositoryOptions, RepositoryBase } from "./RepositoryBase";
import { EntityBase } from "@lindorm-io/core";
import { MockMongo, MockMongoDatabase } from "../class";

class MockEntity extends EntityBase {
  public name: string;

  constructor(options: any) {
    super(options);
    this.name = options.name;
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

describe("RepositoryBase.ts", () => {
  let database: MockMongoDatabase;
  let repository: MockRepository;

  beforeEach(async () => {
    const mongo = new MockMongo({ log: jest.fn() });
    const client = await mongo.connect("client", { mock: true });

    database = await client.db("database");
    repository = new MockRepository({
      // @ts-ignore
      db: database,
      logger: {
        // @ts-ignore
        createChildLogger: jest.fn(() => ({
          debug: jest.fn(),
        })),
      },
    });
  });

  test("should run setup on any method", async () => {
    await repository.create(new MockEntity({ name: "mock" }));
    const collection = database.collections["MockRepository"];

    expect(collection.indices).toStrictEqual([
      {
        index: {
          id: 1,
        },
        options: {
          unique: true,
        },
      },
    ]);
  });

  test("should create entity", async () => {
    const e1 = new MockEntity({ name: "e1" });
    const created = await repository.create(e1);

    expect(created).toStrictEqual(e1);
  });

  test("should update entity", async () => {
    const e1 = new MockEntity({ name: "e1" });
    const created = await repository.create(e1);

    created.name = "changed";

    const updated = await repository.update(created);

    expect(updated).toStrictEqual(created);
  });

  test("should find entity", async () => {
    const e1 = new MockEntity({ name: "e1" });
    await repository.create(e1);

    const found = await repository.find({ name: "e1" });

    expect(found).toStrictEqual(e1);
  });

  test("should find many entities", async () => {
    const e1 = new MockEntity({ name: "ex" });
    const e2 = new MockEntity({ name: "ex" });

    await repository.create(e1);
    await repository.create(e2);

    const found = await repository.findMany({ name: "ex" });

    expect(found).toStrictEqual([e1, e2]);
  });

  test("should remove one entity", async () => {
    const e1 = new MockEntity({ name: "e1" });
    const e2 = new MockEntity({ name: "e2" });

    await repository.create(e1);
    await repository.create(e2);

    await repository.remove(e1);

    await expect(repository.findMany({})).resolves.toStrictEqual([e2]);
  });

  test("should remove many entities", async () => {
    const e1 = new MockEntity({ name: "ex" });
    const e2 = new MockEntity({ name: "ex" });
    const e3 = new MockEntity({ name: "e3" });

    await repository.create(e1);
    await repository.create(e2);
    await repository.create(e3);

    await repository.removeMany({ name: "ex" });

    await expect(repository.findMany({})).resolves.toStrictEqual([e3]);
  });
});
