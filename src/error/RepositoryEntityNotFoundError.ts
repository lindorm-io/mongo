import { ExtendableError, TObject } from "@lindorm-io/core";

export class RepositoryEntityNotFoundError extends ExtendableError {
  constructor(filter: TObject<any>, result: TObject<any>) {
    super("Entity not found", {
      debug: { filter, result },
    });
  }
}
