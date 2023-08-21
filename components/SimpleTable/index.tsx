import React, { ComponentProps } from "react";
import TableRow from "./TableRow";
import classes from "./index.module.scss";
type Props = {
  columns?: ComponentProps<typeof TableRow>["columns"];
  dataSource?: LooseObject[];
  rowKey?: string;
  expandable?: ComponentProps<typeof TableRow>["expandable"];
} & Pick<React.HTMLAttributes<HTMLDivElement>, "className" | "style">;

const SimpleTable: React.FC<Props> = ({
  columns = [],
  dataSource = [],
  rowKey = "id",
  expandable,
  ...props
}) => {
  return (
    <div {...props}>
      <table className={classes.table}>
        <colgroup>
          {expandable && <col style={{ width: 40 }}></col>}
          {columns.map((column) => (
            <col
              key={column.key || column.dataIndex}
              style={{ width: column.width }}
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            {expandable && <th></th>}
            {columns.map((column) => (
              <th key={column.key || column.dataIndex}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource.map((item, i) => (
            <TableRow
              index={i}
              key={item[rowKey]}
              columns={columns}
              item={item}
              expandable={expandable}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SimpleTable;
