import * as conn from "../class/MongoConnection";
import { mongoPing, mongoQuery } from "./mongo-query";

describe("mongo-query.ts", () => {
  let callback: any;

  let getMockOptions: any;

  let mockMongoDb: any;
  let mockMongoConnect: any;
  let mockMongoDisconnect: any;

  let spyMongoConnection: any;

  beforeEach(() => {
    callback = jest.fn();

    mockMongoDb = jest.fn(() => "mock-db");
    mockMongoConnect = jest.fn();
    mockMongoDisconnect = jest.fn();

    getMockOptions = () => ({
      mongoOptions: "mock-mongo-options",
      logger: "mock-logger",
    });

    // @ts-ignore
    spyMongoConnection = jest.spyOn(conn, "MongoConnection").mockImplementation(() => ({
      connect: mockMongoConnect,
      db: mockMongoDb,
      disconnect: mockMongoDisconnect,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe("mongoQuery", () => {
    test("should connect to mongo and use callback", async () => {
      await expect(mongoQuery(getMockOptions(), callback)).resolves.toBe(undefined);

      expect(spyMongoConnection).toHaveBeenCalled();
      expect(mockMongoConnect).toHaveBeenCalled();
      expect(mockMongoDb).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith({ db: "mock-db", logger: "mock-logger" });
      expect(mockMongoDisconnect).toHaveBeenCalled();
    });
  });

  describe("mongoPing", () => {
    test("should return true if a connection can be established", async () => {
      await expect(mongoPing(getMockOptions())).resolves.toBe(true);

      expect(spyMongoConnection).toHaveBeenCalled();
      expect(mockMongoConnect).toHaveBeenCalled();
      expect(mockMongoDisconnect).toHaveBeenCalled();
    });

    test("should return false if a connection cannot be established", async () => {
      mockMongoConnect = jest.fn().mockRejectedValue("ignored");

      await expect(mongoPing(getMockOptions())).resolves.toBe(false);
    });
  });
});
