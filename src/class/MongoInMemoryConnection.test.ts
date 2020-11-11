import MockDate from "mockdate";
import {
  MongoInMemoryConnection,
  MongoInMemoryCollection,
  MongoInMemoryCursor,
  MongoInMemoryDatabase,
} from "./MongoInMemoryConnection";

jest.mock("uuid", () => ({
  v4: () => "e397bc49-849e-4df6-a536-7b9fa3574ace",
}));

MockDate.set("2020-01-01 08:00:00.000");

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

      expect(collection.indices).toMatchSnapshot();
    });

    test("should insert one", async () => {
      await expect(collection.insertOne({ id: 4, name: "four", group: 3, version: 1 })).resolves.toMatchSnapshot();

      expect(collection.data).toMatchSnapshot();
    });

    test("should update one", async () => {
      await expect(
        collection.findOneAndUpdate(
          { id: 1, version: { $eq: 1 } },
          { $set: { name: "changed", group: 1, version: 2 } },
        ),
      ).resolves.toMatchSnapshot();

      expect(collection.data).toMatchSnapshot();
    });

    test("should find one", async () => {
      await expect(collection.findOne({ id: 1 })).resolves.toMatchSnapshot();
    });

    test("should find many", async () => {
      const cursor = await collection.find({ group: 1 });

      await expect(cursor).toStrictEqual(expect.any(MongoInMemoryCursor));

      expect(cursor.data).toMatchSnapshot();

      const array = await cursor.toArray();

      expect(array).toMatchSnapshot();
    });

    test("should delete one", async () => {
      await expect(collection.findOneAndDelete({ id: 1 })).resolves.toMatchSnapshot();

      expect(collection.data).toMatchSnapshot();
    });

    test("should delete many", async () => {
      await expect(collection.deleteMany({ group: 1 })).resolves.toMatchSnapshot();

      expect(collection.data).toMatchSnapshot();
    });
  });
});
