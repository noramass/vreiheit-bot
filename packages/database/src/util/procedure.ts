import { dataSource } from "src/data-source";

export function defineProcedure<Params extends any[] = any[], Return = any>(
  name: string,
): (...params: Params) => Promise<Return> {
  return async function (...params) {
    const paramPlaceholders = params.map((_, index) => `$${index + 1}`);
    return dataSource
      .query(
        `select ${name}(${paramPlaceholders.join(",")}) as result;`,
        params,
      )
      .then(([{ result }]) => result);
  };
}
