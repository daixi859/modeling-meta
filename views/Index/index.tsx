import PageLayout from "@/components/PageLayout";
import req from "@/utils/req";
import useSetState from "@/utils/useSetState";

import React, { useEffect, useMemo } from "react";

import CellKeyword from "@/views/Index/CellKeyword";
import { Input, Space, Segmented } from "antd";
import SimpleTable from "@/components/SimpleTable";

type Fields = React.ComponentProps<typeof SimpleTable>["columns"];
const pageFields: Fields = [
  { title: "页面名称", dataIndex: "pageName" },
  { title: "业务单元", dataIndex: "functionCode" },
  { title: "页面id", dataIndex: "functionPageId" },
  { title: "页面路径", dataIndex: "url" },
  { title: "文件名", dataIndex: "fileName" },
  { title: "修改人", dataIndex: "modifiedBy" },

  {
    title: "修改时间",
    dataIndex: "modifiedOn",
    render(value: string) {
      return new Date(value).toLocaleString();
    },
  },
];
const compFields: Fields = [
  { title: "组件名称", dataIndex: "componentName" },
  { title: "业务单元", dataIndex: "functionCode" },
  { title: "组件id", dataIndex: "componentGuid" },
  { title: "文件名", dataIndex: "fileName" },
  { title: "修改人", dataIndex: "modifiedBy" },
  {
    title: "修改时间",
    dataIndex: "modifiedOn",
    render(value: string) {
      return new Date(value).toLocaleString();
    },
  },
];
const scriptFields: Fields = [
  { title: "脚本名称", dataIndex: "scriptName" },
  { title: "业务单元", dataIndex: "functionCode" },
  { title: "脚本id", dataIndex: "scriptGuid" },
  { title: "文件名", dataIndex: "fileName" },
  { title: "修改人", dataIndex: "modifiedBy" },
  {
    title: "修改时间",
    dataIndex: "modifiedOn",
    render(value: string) {
      return new Date(value).toLocaleString();
    },
  },
];
export default function Page() {
  const [{ pageData, compData, scriptData, tabs, tab, keyword }, setState] =
    useSetState({
      pageData: [] as any[],
      compData: [] as any[],
      scriptData: [] as any[],
      tab: "functionPageId",
      tabs: [
        { label: "页面", value: "functionPageId" },
        { label: "组件", value: "componentGuid" },
        { label: "脚本", value: "scriptGuid" },
      ],
      keyword: "",
    });

  const { fields, data, guids } = useMemo(() => {
    let fields: Fields = [];
    let data = [];
    let guids = [] as string[];
    if (tab == "componentGuid") {
      fields = compFields;
      data = compData;
    } else if (tab == "scriptGuid") {
      fields = scriptFields;
      data = scriptData;
    } else {
      fields = pageFields;
      data = pageData;
    }
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

    return { fields, data, guids };
  }, [compData, pageData, scriptData, tab, keyword]);

  useEffect(() => {
    req
      .get<{ compData: any[]; pageData: any[]; scriptData: any[] }>("/api/user")
      .then(({ pageData, compData, scriptData }) => {
        setState({ pageData, compData, scriptData });
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
          placeholder="请输入"
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
        rowKey={tab}
        expandable={{
          expandedRowRender: (item) => (
            <CellKeyword keyword={keyword} item={item} />
          ),
        }}
      />
    </PageLayout>
  );
}
