import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ValueRenderer,
  ValueRendererOptions,
} from "src/components/general/value-renderer";

export interface CellContext<Row, Cell> {
  data: Cell;
  row: Row;
  col: ColumnDefinition<Row, Cell>;
  index: number;
  page?: number;
  pageSize?: number;
  filter?: string;
}

export interface ColumnProps<Row, Cell> {
  children?: ReactNode;
  title?: string;
  resolve?:
    | (keyof {
        [Key in keyof Row]: Row[Key] extends Cell ? Key : never;
      } &
        string)
    | ((data: Row) => Cell);
  key: string;
  sortable?: boolean;
  filterable?: boolean;
  renderOptions?: ValueRendererOptions;
  render?(context: CellContext<Row, Cell>): ReactNode;
}

export interface ColumnDefinition<Row, Cell> {
  type: "column";
  key: string;
  children: ReactNode;
  resolve: (data: Row) => Cell;
  sortable: boolean;
  filterable: boolean;
  render(context: CellContext<Row, Cell>): ReactNode;
}

export interface ColumnControlsProps<Row, Cell> {
  definition: ColumnDefinition<Row, Cell>;
}

export function ColumnControls<Row, Cell>({
  definition,
}: ColumnControlsProps<Row, Cell>) {
  const [, setSort] = useState<boolean | undefined>(undefined);
  const { filter } = useContext(TableContext);
  return (
    <div>
      {definition.sortable && (
        <button onClick={() => setSort(it => !it)}>Sort</button>
      )}
      {definition.filterable && (
        <input
          type="text"
          onChange={ev =>
            filter(definition.key, ev.currentTarget.value || undefined)
          }
        />
      )}
    </div>
  );
}

export function Column<Row, Cell>({
  children,
  title,
  resolve,
  render,
  key,
  sortable = false,
  filterable = false,
  renderOptions,
}: ColumnProps<Row, Cell>): JSX.Element {
  const { column } = useContext(TableContext);
  useEffect(
    () =>
      column({
        type: "column",
        key,
        children: children ?? title,
        resolve: !resolve
          ? data => (data as any)[key]
          : typeof resolve === "string"
          ? data => data[resolve] as any
          : resolve,
        render:
          render ??
          (({ data, filter }) => (
            <ValueRenderer value={data} {...renderOptions} highlight={filter} />
          )),
        sortable,
        filterable,
      }),
    [],
  );
  return null as any;
}

export function columnOf<T>(): <Cell>(
  props: ColumnProps<T, Cell>,
) => JSX.Element {
  return Column;
}

export interface TableProps<T> {
  data: T[];
  rowKey?: keyof T | ((data: T, index: number) => string | number);
  children: ReactNode;
}

export function Table<T>({ data, children, rowKey }: TableProps<T>) {
  const [columns, setColumns] = useState<ColumnDefinition<T, any>[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState<number | undefined>(undefined);
  const [pageSize, setPageSize] = useState<number | undefined>(undefined);

  const ctx: TableContext = useMemo(
    () => ({
      data,
      columns,
      filters,
      column: def => {
        setColumns(all => [...all, def]);
        return () => setColumns(all => all.filter(it => it !== def));
      },
      filter: (key, value) =>
        setFilters(all => ({
          ...all,
          [key]: value as string,
        })),
      setPage,
      setPageSize,
    }),
    [data, columns, filters],
  );

  console.log(filters);

  const keyFor: (row: T, index: number) => string | number =
    typeof rowKey === "function"
      ? rowKey
      : typeof rowKey === "string"
      ? (data: any) => data[rowKey]
      : (data: any, index: number) => `row-${index}`;
  return (
    <TableContext.Provider value={ctx}>
      <table>
        <thead>
          {columns.map(def => (
            <th key={def.key}>
              <span>{def.children}</span>
              <ColumnControls definition={def} />
            </th>
          ))}
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={keyFor(row, index)}>
              {columns.map(col => (
                <td key={`${keyFor(row, index)}--${col.key}`}>
                  {col.render({
                    data: col.resolve(row),
                    filter: filters[col.key],
                    index,
                    row,
                    col,
                    page,
                    pageSize,
                  })}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>{children}</tfoot>
      </table>
    </TableContext.Provider>
  );
}

const thrower = (message: string) => () => {
  throw new Error(message);
};

const TableContext = createContext<TableContext>({
  data: [],
  columns: [],
  filters: {},
  column: thrower("Needs to be called inside a table"),
  filter: thrower("Needs to be called inside a table"),
  setPage: thrower("Needs to be called inside a table"),
  setPageSize: thrower("Needs to be called inside a table"),
});

export interface TableContext<T = any> {
  data: T[];
  columns: ColumnDefinition<T, any>[];
  filters: Record<string, string>;
  page?: number;
  pageSize?: number;
  column(def: ColumnDefinition<T, any>): () => void;
  filter(row: string, value?: string): void;
  setPage(page?: number): void;
  setPageSize(pageSize?: number): void;
}

export function TextTable() {
  const [showDesc, setShowDesc] = useState(false);
  type DataType = { id: string; name: string; desc: string };
  const data: DataType[] = [
    { id: "1", name: "foo", desc: "the foo" },
    { id: "2", name: "bar", desc: "the bar" },
    { id: "3", name: "foo", desc: "the foo" },
    { id: "4", name: "bar", desc: "the bar" },
  ];

  const Column = columnOf<DataType>();

  return (
    <>
      <button onClick={() => setShowDesc(it => !it)}>Show Desc</button>
      <Table data={data}>
        <Column key="id" resolve="id" title="ID" sortable />
        <Column key="name" resolve="name" sortable filterable>
          Name
        </Column>
        {showDesc && (
          <Column
            key="desc"
            resolve={(data: DataType) => data.desc}
            title="Desc"
            filterable
          />
        )}
      </Table>
    </>
  );
}
