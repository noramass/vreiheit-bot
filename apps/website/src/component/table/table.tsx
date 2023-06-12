import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useInsertionEffect,
  useMemo,
  useState,
} from "react";
import { ValueRenderer } from "src/component/general/value-renderer";

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
  render?(context: CellContext<Row, Cell>): ReactNode;
}

export interface ColumnDefinition<Row, Cell> {
  type: "column";
  key: string;
  children: ReactNode;
  resolve: (data: Row) => Cell;
  render(context: CellContext<Row, Cell>): ReactNode;
}

export function Column<Row, Cell>({
  children,
  title,
  resolve,
  render,
  key,
}: ColumnProps<Row, Cell>) {
  const { column } = useContext(TableContext);
  useEffect(
    () =>
      column({
        type: "column",
        key,
        children: children ?? title,
        resolve:
          typeof resolve === "string" ? data => data[resolve] as any : resolve,
        render:
          render ??
          (({ data, filter }) => (
            <ValueRenderer value={data} highlight={filter} />
          )),
      }),
    [],
  );
  return <></>;
}

export function columnOf<T>(): <Cell>(
  props: ColumnProps<T, Cell>,
) => JSX.Element {
  return Column;
}

export interface TableProps<T> {
  data: T[];
  children: ReactNode;
}

export function Table<T>({ data, children }: TableProps<T>) {
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
        return () => setColumns(all => all.filter(it => it.key !== def.key));
      },
      filter: (key, value) =>
        setFilters(all => ({
          ...all,
          [key]: value,
        })),
      setPage,
      setPageSize,
    }),
    [data],
  );
  return (
    <TableContext.Provider value={ctx}>
      <table>
        <thead>
          {columns.map(def => (
            <th key={def.key}>{def.children}</th>
          ))}
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr>
              {columns.map(col => (
                <td key={`${index}-${col.key}`}>
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
        <tfoot>{}</tfoot>
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
  type DataType = { id: string; name: string; desc: string };
  const data: DataType[] = [
    { id: "1", name: "foo", desc: "the foo" },
    { id: "2", name: "bar", desc: "the bar" },
    { id: "3", name: "foo", desc: "the foo" },
    { id: "4", name: "bar", desc: "the bar" },
  ];

  const Column = columnOf<DataType>();

  return (
    <Table data={data}>
      <Column key="id" resolve="id" title="ID" />
      <Column key="name" resolve="name">
        Name
      </Column>
      <Column key="desc" resolve={(data: DataType) => data.desc} title="Desc" />
    </Table>
  );
}
