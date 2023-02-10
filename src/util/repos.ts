import { dataSource } from "src/database/data-source";
import { EntityTarget, FindManyOptions } from "typeorm";

export async function* createPagingQuery<T>(
  entity: EntityTarget<T>,
  options: FindManyOptions<T>,
  take = 20,
  skip = 0,
) {
  const repo = dataSource.getRepository<T>(entity);
  const opts: FindManyOptions<T> = { ...options, take, skip };
  let items: T[], count: number, newCount: number;
  do {
    [items, newCount] = await repo.findAndCount(opts);
    if (count == null) count = newCount;
    if (newCount !== count) {
      opts.skip -= Math.abs(count - newCount);
      count = newCount;
    }
    yield items;
  } while ((opts.skip += take) < count);
}
