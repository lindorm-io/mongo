import { ExtendableError, TObject } from "@lindorm-io/global";
import { FindAndModifyWriteOpResultObject } from "mongodb";

export class RepositoryEntityNotUpdatedError extends ExtendableError {
  constructor(filter: TObject<any>, result: FindAndModifyWriteOpResultObject<any>) {
    super("Unable to update Entity", {
      debug: { filter, result },
    });
  }
}
