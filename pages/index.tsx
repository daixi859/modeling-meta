import PageLayout from "@/components/PageLayout";
import req from "@/utils/req";
import useSetState from "@/utils/useSetState";

import { useEffect } from "react";
import { Page_ITEM } from "./api/user";
// 生成一份object的key的类型，并将非 T 继承类型的key的值类型置为 never
type ExtractType<O, T> = { [K in keyof O]: O[K] extends T ? O[K] : unknown };

// 组合两个 object 的类型
type Diff<T extends string, U> = ({ [P in T]: P } & {
  [P in keyof U]: U[P] extends string ? string : never;
} & {
  [x: string]: never;
})[T];

// 这里我们只以 string 类型的key作为示例
type ExtractStringKey<A> = Diff<
  Extract<keyof A, string>,
  ExtractType<A, string>
>;

const fields: {
  label: string;
  name: ExtractStringKey<Page_ITEM>;
  render?: (value: any) => React.ReactNode;
}[] = [
  { label: "页面名称", name: "pageName" },
  { label: "业务单元", name: "functionCode" },
  { label: "页面id", name: "functionPageId" },
  { label: "页面路径", name: "url" },
  { label: "修改人", name: "modifiedBy" },
  {
    label: "修改时间",
    name: "modifiedOn",
    render(value: string) {
      return new Date(value).toLocaleString();
    },
  },
];
export default function Page() {
  const [{ list }, setState] = useSetState({ list: [] as Page_ITEM[] });
  useEffect(() => {
    req.get<Page_ITEM[]>("/api/user").then((data) => {
      setState({ list: data });
    });
  }, [setState]);
  return (
    <PageLayout>
      <table className="w-full">
        <thead>
          <tr>
            {fields.map((f) => (
              <th key={f.name}>{f.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map((t) => (
            <tr key={t.functionPageId}>
              {fields.map((f) => (
                <td key={f.name}>
                  {f.render ? f.render(t[f.name]) : t[f.name]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </PageLayout>
  );
}
