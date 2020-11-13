import { mongoPing, mongoQuery } from "./mongo-query";
import { MongoConnectionType } from "../enum";
import { TObject } from "@lindorm-io/core";

describe("m", () => {
  let inMemoryStore: TObject<any>;
  let callback: any;
  let getMockOptions: any;

  beforeEach(() => {
    inMemoryStore = { initialized: true };

    callback = jest.fn();

    getMockOptions = () => ({
      mongoOptions: {
        type: MongoConnectionType.MEMORY,
        auth: {
          user: "user",
          password: "password",
        },
        url: {
          host: "host",
          port: 1234,
        },
        databaseName: "databaseName",
        inMemoryStore,
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
          database: {},
          databaseName: "databaseName",
        },
        logger: "mock-logger",
      });
      expect(inMemoryStore).toMatchSnapshot();
    });
  });

  describe("mongoPing", () => {
    test("should return true if a connection can be established", async () => {
      await expect(mongoPing(getMockOptions())).resolves.toBe(true);
    });
  });
});
