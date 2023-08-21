import PageLayout from "@/components/PageLayout";
import req from "@/utils/req";
import useSetState from "@/utils/useSetState";

import React, { useEffect, useMemo } from "react";

import CellKeyword from "@/views/Index/CellKeyword";
import { Input, Space, Segmented, Tag, Button } from "antd";
import SimpleTable from "@/components/SimpleTable";
import classes from "./index.module.scss";
type Fields = React.ComponentProps<typeof SimpleTable>["columns"];

const fields: Fields = [
  {
    title: "页面/组件/脚本名称",
    dataIndex: "name",
    render(name, recode) {
      return (
        <>
          {recode.type === "page" ? (
            <Tag color="red">页面</Tag>
          ) : recode.type == "component" ? (
            <Tag color="blue">组件</Tag>
          ) : (
            <Tag color="green">脚本</Tag>
          )}
          {name}
        </>
      );
    },
  },
  { title: "业务单元", dataIndex: "functionCode" },
  { title: "id", dataIndex: "id" },
  { title: "文件名", dataIndex: "filename" },
  { title: "修改人", dataIndex: "modifiedBy" },
  {
    title: "修改时间",
    dataIndex: "modifiedOn",
    render(value: string) {
      return new Date(value).toLocaleString();
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    className: classes.action,
    width: 150,
    render(_, row) {
      const host = process.env.NEXT_PUBLIC_MODELHOST;
      const typeUrlMap: LooseObject = {
        page: "function-page-coding",
        component: "business-component",
        script: "business-script",
      };
      return (
        <>
          {row.type === "page" && (
            <a href={host + row.url} target="_blank">
              查看
            </a>
          )}
          <a
            href={host + `/coding/${typeUrlMap[row.type]}/${row.id}`}
            target="_blank"
          >
            编辑
          </a>
          <span>引用</span>
          {row.type !== "page" && <span>被引用</span>}
        </>
      );
    },
  },
];

export default function Page() {
  const [{ tabs, tab, keyword, list }, setState] = useSetState({
    list: [] as any[],
    tab: "",
    tabs: [
      { label: "全部", value: "" },
      { label: "页面", value: "page" },
      { label: "组件", value: "component" },
      { label: "脚本", value: "script" },
    ],
    keyword: "",
  });

  const { data } = useMemo(() => {
    let data = list.filter((t) => (tab ? t.type === tab : true));

    if (keyword) {
      data = data.filter((item) => {
        let flag = false;
        if (item.html && item.html.indexOf(keyword) > -1) {
          flag = true;
        }
        if (item.style && item.style.indexOf(keyword) > -1) {
          flag = true;
        }
        if (item.script && item.script.indexOf(keyword) > -1) {
          flag = true;
        }
        return flag;
      });
    }

    return { data };
  }, [list, keyword, tab]);

  useEffect(() => {
    req
      .get<{ compData: any[]; pageData: any[]; scriptData: any[] }>("/api/user")
      .then(({ pageData, compData, scriptData }) => {
        let list = pageData
          .map((t) => ({
            ...t,
            type: "page",
            name: t.pageName,
            id: t.functionPageId,
          }))
          .concat(
            compData.map((t) => ({
              ...t,
              type: "component",
              name: t.componentName,
              id: t.componentGuid,
            }))
          )
          .concat(
            scriptData.map((t) => ({
              ...t,
              type: "script",
              name: t.scriptName,
              id: t.scriptGuid,
            }))
          );

        setState({ list });
      });
  }, [setState]);

  return (
    <PageLayout>
      <Space className="mb-3">
        <Segmented
          options={tabs}
          value={tab}
          onChange={(tab) => setState({ tab: tab as string })}
        />
        <Input.Search
          placeholder="请输入代码搜索"
          allowClear
          onBlur={(e) => {
            setState({ keyword: e.target.value });
          }}
          onSearch={(keyword) => {
            setState({ keyword });
          }}
        />
      </Space>
      <SimpleTable
        columns={fields}
        dataSource={data}
        expandable={{
          expandedRowRender: (item) => (
            <CellKeyword keyword={keyword} item={item} />
          ),
          rowExpandable: (item, i) => (i === 0 ? !!keyword : false),
        }}
      />
    </PageLayout>
  );
}
