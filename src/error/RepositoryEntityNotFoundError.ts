import { ExtendableError, TObject } from "@lindorm-io/global";

export class RepositoryEntityNotFoundError extends ExtendableError {
  constructor(filter: TObject<any>, result: TObject<any>) {
    super("Entity not found", {
      debug: { filter, result },
    });
  }
}
