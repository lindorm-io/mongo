import { MongoConnectionType } from "../enum";
import { MongoConnection } from "./MongoConnection";
import { TObject } from "@lindorm-io/core";

describe("MongoConnection", () => {
  let inMemoryStore: TObject<any>;
  let connection: MongoConnection;

  beforeEach(() => {
    inMemoryStore = {
      primaryDb: {},
    };

    connection = new MongoConnection({
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
  });

  test("should connect and persist", async () => {
    await connection.connect();

    const db = connection.getDatabase();
    expect(db).toMatchSnapshot();

    const collection = await db.collection("coName");
    expect(collection).toMatchSnapshot();

    await collection.createIndex({ index: true }, { options: true });
    expect(collection).toMatchSnapshot();

    await collection.insertOne({
      id: "1",
      group: "1",
      version: 0,
      data: { string: "string", number: 12345 },
    });
    expect(collection).toMatchSnapshot();

    await collection.insertOne({
      id: "2",
      group: "1",
      version: 0,
      data: { bool: true, arr: [] },
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
    await collection.deleteMany({ group: "1" });

    await connection.disconnect();

    expect(inMemoryStore).toMatchSnapshot();
  });
});
