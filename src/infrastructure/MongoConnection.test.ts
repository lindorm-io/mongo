import { MongoConnectionType } from "../enum";
import { MongoConnection } from "./MongoConnection";
import { MONGO_IN_MEMORY_DB } from "../class";

describe("MongoConnection", () => {
  let connection: MongoConnection;

  beforeEach(() => {
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
    });
  });

  test("should connect and persist", async () => {
    expect(MONGO_IN_MEMORY_DB).toMatchSnapshot();

    await connection.connect();

    const db = connection.getDatabase();
    expect(MONGO_IN_MEMORY_DB).toMatchSnapshot();

    const collection = await db.collection("coName");
    expect(MONGO_IN_MEMORY_DB).toMatchSnapshot();

    await collection.createIndex({ index: true }, { options: true });
    expect(MONGO_IN_MEMORY_DB).toMatchSnapshot();

    await collection.insertOne({
      id: "1",
      group: "1",
      version: 0,
      data: { string: "string", number: 12345 },
    });
    expect(MONGO_IN_MEMORY_DB).toMatchSnapshot();

    await collection.insertOne({
      id: "2",
      group: "1",
      version: 0,
      data: { bool: true, arr: [] },
    });
    expect(MONGO_IN_MEMORY_DB).toMatchSnapshot();

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
    expect(MONGO_IN_MEMORY_DB).toMatchSnapshot();

    await expect(collection.findOne({ id: "1" })).resolves.toMatchSnapshot();

    await expect(collection.find({ group: "1" })).resolves.toMatchSnapshot();

    await collection.findOneAndDelete({ id: "1" });
    await collection.deleteMany({ group: "1" });

    await connection.disconnect();
    expect(MONGO_IN_MEMORY_DB).toMatchSnapshot();
  });
});
