import PageLayout from "@/components/PageLayout";
import req from "@/utils/req";
import useSetState from "@/utils/useSetState";

import React, { useEffect, useMemo } from "react";

import CellKeyword from "@/views/Index/CellKeyword";
import { Input, Space, Segmented, Tag, Select, Breadcrumb } from "antd";
import SimpleTable from "@/components/SimpleTable";
import classes from "./index.module.scss";
type Fields = React.ComponentProps<typeof SimpleTable>["columns"];
const host = process.env.NEXT_PUBLIC_MODELHOST;

export default function Page() {
  const [
    { tabs, tab, keyword, list, pageId, codeId, functionCode, quoteItems },
    setState,
  ] = useSetState({
    list: [] as any[],
    tab: "",
    tabs: [
      { label: "全部", value: "" },
      { label: "页面", value: "page" },
      { label: "组件", value: "component" },
      { label: "脚本", value: "script" },
    ],
    keyword: "",
    pageId: "",
    codeId: "",
    functionCode: undefined,
    quoteItems: [] as {
      type: "q" | "bq";
      keyword?: string;
      item: LooseObject;
    }[],
  });

  const fields = useMemo(() => {
    const fields: Fields = [
      {
        title: "页面/组件/脚本名称",
        dataIndex: "name",
        render(name, row) {
          const tagMap: LooseObject = {
            component: "componentId",
            script: "scriptId",
          };
          return (
            <div className="flex">
              <div>
                {row.type === "page" ? (
                  <Tag color="red">页面</Tag>
                ) : row.type == "component" ? (
                  <Tag color="blue">组件</Tag>
                ) : (
                  <Tag color="green">脚本</Tag>
                )}
              </div>
              <div>
                {row.type === "page" ? (
                  <a
                    href={host + row.url}
                    target="_blank"
                    className="hover:text-blue-500"
                  >
                    {name}
                  </a>
                ) : (
                  name
                )}
                {tagMap[row.type] && <div>{row[tagMap[row.type]]}</div>}
              </div>
            </div>
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
          const typeUrlMap: LooseObject = {
            page: "function-page-coding",
            component: "business-component",
            script: "business-script",
          };
          return (
            <>
              <a
                href={host + `/coding/${typeUrlMap[row.type]}/${row.id}`}
                target="_blank"
              >
                编辑
              </a>
              {row.dependencies.length > 0 && (
                <span
                  onClick={() =>
                    setState({
                      quoteItems: quoteItems.concat({ type: "q", item: row }),
                    })
                  }
                >
                  引用
                </span>
              )}

              {row.bDependencies.length > 0 && (
                <span
                  onClick={() =>
                    setState({
                      quoteItems: quoteItems.concat({ type: "bq", item: row }),
                    })
                  }
                >
                  被引用
                </span>
              )}
            </>
          );
        },
      },
    ];
    return fields;
  }, [setState, quoteItems]);

  const { data, quote, kw } = useMemo(() => {
    let data = list;
    let kw = keyword;
    const quote = quoteItems[quoteItems.length - 1];
    if (quote) {
      kw = quote.keyword || "";
      const dependencies =
        quote.type == "q" ? quote.item.dependencies : quote.item.bDependencies;
      data = data.filter((t) => dependencies.indexOf(t.id) > -1);
    } else {
      data = data
        .filter((t) => (tab ? t.type === tab : true))
        .filter((t) =>
          pageId ? (t.url ? t.url.indexOf(pageId) > -1 : false) : true
        )
        .filter((t) => (codeId ? t.id === codeId : true))
        .filter((t) => (functionCode ? t.functionCode === functionCode : true));
    }

    if (kw) {
      data = data.filter((item) => {
        let flag = false;
        if (item.html && item.html.indexOf(kw) > -1) {
          flag = true;
        }
        if (item.style && item.style.indexOf(kw) > -1) {
          flag = true;
        }
        if (item.script && item.script.indexOf(kw) > -1) {
          flag = true;
        }
        return flag;
      });
    }

    return { data, quote, kw };
  }, [list, keyword, tab, pageId, codeId, functionCode, quoteItems]);

  const functionCodeOptions = useMemo(() => {
    return Array.from(new Set(list.map((t) => t.functionCode))).map((t) => ({
      value: t,
      label: t,
    }));
  }, [list]);

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
        var bDependencies: Record<string, string[]> = {};
        list.forEach((t) => {
          t.dependencies = [];
          if (t.dependentComponents) {
            t.dependencies = t.dependencies.concat(
              t.dependentComponents.map((t: any) => t.componentGuid)
            );
          }
          if (t.dependentScripts) {
            t.dependencies = t.dependencies.concat(
              t.dependentScripts.map((t: any) => t.scriptGuid)
            );
          }
          t.dependencies.forEach((id: any) => {
            if (!bDependencies[id]) {
              bDependencies[id] = [];
            }
            if (bDependencies[id].indexOf(t.id) == -1) {
              bDependencies[id].push(t.id);
            }
          });
        });
        list.forEach((t) => {
          t.bDependencies = bDependencies[t.id] || [];
        });

        setState({ list });
      });
  }, [setState]);
  const items = [
    {
      title: <span className="cursor-pointer">全部</span>,
      onClick() {
        setState({ quoteItems: [] });
      },
    },
  ].concat(
    quoteItems.map((t, i) => ({
      title: (
        <span className="cursor-pointer">
          {t.item.name + (t.type === "q" ? "-引用" : "-被引用")}
        </span>
      ),
      onClick() {
        setState({ quoteItems: quoteItems.slice(0, i + 1) });
      },
    }))
  );
  return (
    <PageLayout>
      {!quote && (
        <Space className="mb-2 mt-2">
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
          <Select
            allowClear
            className="w-36"
            placeholder="业务单元"
            value={functionCode}
            options={functionCodeOptions}
            onChange={(t) => setState({ functionCode: t })}
          ></Select>
          <Input.Search
            placeholder="编辑ID"
            allowClear
            onBlur={(e) => {
              setState({ codeId: e.target.value });
            }}
            onSearch={(codeId) => {
              setState({ codeId });
            }}
          />
          {(tab === "page" || tab === "") && (
            <Input.Search
              placeholder="页面ID"
              allowClear
              onBlur={(e) => {
                setState({ pageId: e.target.value });
              }}
              onSearch={(pageId) => {
                setState({ pageId });
              }}
            />
          )}
        </Space>
      )}

      {quote && (
        <Space className="mb-2 mt-2">
          <Input.Search
            placeholder="请输入代码搜索"
            allowClear
            onBlur={(e) => {
              quote.keyword = e.target.value;
              setState({ quoteItems: quoteItems.slice() });
            }}
            onSearch={(keyword) => {
              quote.keyword = keyword;
              setState({ quoteItems: quoteItems.slice() });
            }}
          />
          <Breadcrumb items={items} />
        </Space>
      )}

      <SimpleTable
        columns={fields}
        dataSource={data}
        expandable={{
          expandedRowRender: (item) => <CellKeyword keyword={kw} item={item} />,
          rowExpandable: (item, i) => (i === 0 ? !!kw : false),
        }}
      />
    </PageLayout>
  );
}
