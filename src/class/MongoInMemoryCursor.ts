import { TObject } from "@lindorm-io/core";

export class MongoInMemoryCursor {
  public data: Array<TObject<any>>;

  constructor(data: Array<TObject<any>>) {
    this.data = data;
  }

  public async toArray(): Promise<Array<TObject<any>>> {
    return Promise.resolve(this.data);
  }
}
