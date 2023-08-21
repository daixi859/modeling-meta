import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
type Column = {
  title: string;
  dataIndex: string;
  width?: number;
  key?: string;
  className?: string;
  render?: (text: any, recode: any, index: number) => React.ReactNode;
};

type Props = {
  columns: Column[];
  item: any;
  index: number;
  expandable?: {
    expandedRowRender: (record: any, i: number) => React.ReactNode;
    rowExpandable?: (record: any, i: number) => boolean;
  };
};

const TableRow: React.FC<Props> = ({ columns, item, expandable, index }) => {
  const myExpend =
    (expandable?.rowExpandable && expandable?.rowExpandable(item, index)) ||
    false;

  const [expand, setExpand] = useState(myExpend);
  useEffect(() => {
    setExpand(myExpend);
  }, [myExpend]);
  return (
    <>
      <tr>
        {expandable && (
          <td
            className="text-blue-500 cursor-pointer text-base"
            onClick={() => setExpand(!expand)}
          >
            {!expand ? <PlusCircleOutlined /> : <MinusCircleOutlined />}
          </td>
        )}
        {columns.map((column) => (
          <td key={column.key || column.dataIndex} className={column.className}>
            {column.render
              ? column.render(item[column.dataIndex], item, index)
              : item[column.dataIndex]}
          </td>
        ))}
      </tr>
      {expandable && expand && (
        <tr>
          <td colSpan={columns.length + 1}>
            {expandable.expandedRowRender(item, index)}
          </td>
        </tr>
      )}
    </>
  );
};

export default TableRow;
