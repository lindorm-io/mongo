import {
  MongoInMemoryConnection,
  MongoInMemoryCollection,
  MongoInMemoryCursor,
  MongoInMemoryDatabase,
} from "./MongoInMemoryConnection";

describe("MockMongoConnection", () => {
  describe("initializations", () => {
    let mongo: MongoInMemoryConnection;

    beforeEach(() => {
      mongo = new MongoInMemoryConnection({
        user: "user",
        password: "password",
        host: "host",
        port: 25000,
        name: "database",
      });
    });

    test("should return a database", async () => {
      const database = mongo.db();

      expect(database).toStrictEqual(expect.any(MongoInMemoryDatabase));
      expect(mongo.client.databases["database"]).toStrictEqual(expect.any(MongoInMemoryDatabase));
      expect(database.databaseName).toBe("database");
    });

    test("should return a collection", async () => {
      const database = mongo.db();
      const collection = await database.collection("collection");

      expect(collection).toStrictEqual(expect.any(MongoInMemoryCollection));
      expect(database.collections["collection"]).toStrictEqual(expect.any(MongoInMemoryCollection));
    });
  });

  describe("collections", () => {
    let collection: MongoInMemoryCollection;

    beforeEach(async () => {
      const mongo = new MongoInMemoryConnection({
        user: "user",
        password: "password",
        host: "host",
        port: 25000,
        name: "database",
      });
      const database = mongo.db();

      collection = await database.collection("collection");

      await collection.insertOne({ id: 1, name: "one", group: 1, version: 1 });
      await collection.insertOne({ id: 2, name: "two", group: 1, version: 1 });
      await collection.insertOne({ id: 3, name: "three", group: 2, version: 1 });
    });

    test("should create index", async () => {
      await expect(collection.createIndex({ id: 1 }, { opts: true })).resolves.toBe(undefined);

      expect(collection.indices).toStrictEqual([
        {
          index: {
            id: 1,
          },
          options: {
            opts: true,
          },
        },
      ]);
    });

    test("should insert one", async () => {
      await expect(collection.insertOne({ id: 4, name: "four", group: 3, version: 1 })).resolves.toStrictEqual({
        result: { ok: true },
      });

      expect(collection.data).toStrictEqual([
        {
          group: 1,
          id: 1,
          name: "one",
          version: 1,
        },
        {
          group: 1,
          id: 2,
          name: "two",
          version: 1,
        },
        {
          group: 2,
          id: 3,
          name: "three",
          version: 1,
        },
        {
          group: 3,
          id: 4,
          name: "four",
          version: 1,
        },
      ]);
    });

    test("should update one", async () => {
      await expect(
        collection.findOneAndUpdate(
          { id: 1, version: { $eq: 1 } },
          { $set: { name: "changed", group: 1, version: 2 } },
        ),
      ).resolves.toStrictEqual({
        lastErrorObject: {
          n: 1,
          updatedExisting: 1,
        },
        ok: true,
        value: 1,
      });

      expect(collection.data).toStrictEqual([
        {
          group: 1,
          id: 2,
          name: "two",
          version: 1,
        },
        {
          group: 2,
          id: 3,
          name: "three",
          version: 1,
        },
        {
          group: 1,
          id: 1,
          name: "changed",
          version: 2,
        },
      ]);
    });

    test("should find one", async () => {
      await expect(collection.findOne({ id: 1 })).resolves.toStrictEqual({ id: 1, name: "one", group: 1, version: 1 });
    });

    test("should find many", async () => {
      const cursor = await collection.find({ group: 1 });

      await expect(cursor).toStrictEqual(expect.any(MongoInMemoryCursor));

      expect(cursor.data).toStrictEqual([
        {
          group: 1,
          id: 1,
          name: "one",
          version: 1,
        },
        {
          group: 1,
          id: 2,
          name: "two",
          version: 1,
        },
      ]);

      const array = await cursor.toArray();

      expect(array).toStrictEqual([
        {
          group: 1,
          id: 1,
          name: "one",
          version: 1,
        },
        {
          group: 1,
          id: 2,
          name: "two",
          version: 1,
        },
      ]);
    });

    test("should delete one", async () => {
      await expect(collection.findOneAndDelete({ id: 1 })).resolves.toStrictEqual({ ok: true });

      expect(collection.data).toStrictEqual([
        {
          group: 1,
          id: 2,
          name: "two",
          version: 1,
        },
        {
          group: 2,
          id: 3,
          name: "three",
          version: 1,
        },
      ]);
    });

    test("should delete many", async () => {
      await expect(collection.deleteMany({ group: 1 })).resolves.toStrictEqual({
        result: {
          ok: true,
          n: 2,
        },
      });

      expect(collection.data).toStrictEqual([
        {
          group: 2,
          id: 3,
          name: "three",
          version: 1,
        },
      ]);
    });
  });
});
