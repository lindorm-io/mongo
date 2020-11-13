import { MongoConnectionType } from "../enum";
import { MongoConnection } from "./MongoConnection";
import { TObject } from "@lindorm-io/core";

describe("MongoConnection", () => {
  let inMemoryStore: TObject<any>;
  let connection1: MongoConnection;
  let connection2: MongoConnection;

  beforeEach(async () => {
    inMemoryStore = { initialized: true };

    connection1 = new MongoConnection({
      auth: {
        user: "user",
        password: "password",
      },
      databaseName: "dbName",
      type: MongoConnectionType.MEMORY,
      url: {
        host: "host",
        port: 1234,
      },
      inMemoryStore,
    });
    connection2 = new MongoConnection({
      auth: {
        user: "user",
        password: "password",
      },
      databaseName: "dbName",
      type: MongoConnectionType.MEMORY,
      url: {
        host: "host",
        port: 1234,
      },
      inMemoryStore,
    });

    await connection1.connect();
    await connection2.connect();
  });

  test("should persist", async () => {
    const db = connection1.getDatabase();

    const collection = await db.collection("coName");
    await collection.createIndex({ index: true }, { options: true });

    await collection.insertOne({
      id: "1",
      group: "1",
      version: 0,
      data: { string: "string", number: 123, bool: true, arr: [] },
    });
    await collection.insertOne({
      id: "2",
      group: "1",
      version: 0,
      data: { string: "string", number: 123, bool: true, arr: [] },
    });
    await collection.insertOne({
      id: "3",
      group: "2",
      version: 0,
      data: { string: "string", number: 123, bool: true, arr: [] },
    });
    expect(collection).toMatchSnapshot();

    await collection.findOneAndUpdate(
      { id: "2", version: { $eq: 0 } },
      {
        $set: {
          id: "2",
          group: "1",
          version: 1,
          data: { bool: true, arr: [] },
        },
      },
    );
    expect(collection).toMatchSnapshot();

    await expect(collection.findOne({ id: "1" })).resolves.toMatchSnapshot();

    await expect(collection.find({ group: "1" })).resolves.toMatchSnapshot();

    await collection.findOneAndDelete({ id: "1" });
    expect(inMemoryStore).toMatchSnapshot();

    await collection.deleteMany({ group: "1" });
    expect(inMemoryStore).toMatchSnapshot();

    await connection1.disconnect();
    await connection2.disconnect();

    expect(connection1.getDatabase()).toMatchSnapshot();
    expect(connection2.getDatabase()).toMatchSnapshot();

    expect(inMemoryStore).toMatchSnapshot();
  });
});
