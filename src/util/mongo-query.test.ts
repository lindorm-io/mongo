import { mongoPing, mongoQuery } from "./mongo-query";
import { MongoConnectionType } from "../enum";

describe("m", () => {
  let callback: any;
  let getMockOptions: any;

  beforeEach(() => {
    callback = jest.fn();

    getMockOptions = () => ({
      mongoOptions: {
        type: MongoConnectionType.MEMORY,
        databaseName: "databaseName",
        auth: {
          user: "user",
          password: "password",
        },
        url: {
          host: "host",
          port: 1234,
        },
      },
      logger: "mock-logger",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe("mongoQuery", () => {
    test("should connect to mongo and use callback", async () => {
      await expect(mongoQuery(getMockOptions(), callback)).resolves.toBe(undefined);

      expect(callback).toHaveBeenCalledWith({
        db: {
          collections: {},
          databaseName: "databaseName",
        },
        logger: "mock-logger",
      });
    });
  });

  describe("mongoPing", () => {
    test("should return true if a connection can be established", async () => {
      await expect(mongoPing(getMockOptions())).resolves.toBe(true);
    });
  });
});
