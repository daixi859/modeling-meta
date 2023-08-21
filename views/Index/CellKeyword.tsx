import React from "react";

type Props = {
  keyword: string;
  item: any;
};

const CellKeyword: React.FC<Props> = ({ item, keyword }) => {
  var arr = [
    toPreHtml(item, keyword, "html"),
    toPreHtml(item, keyword, "script"),
    toPreHtml(item, keyword, "style"),
  ];
  console.log(arr);
  return (
    <div className="flex">
      {arr.map((t, i) => (
        <div
          key={i}
          className="flex-1 flex-shrink border-l px-2 border-l-slate-100 first:border-none text-xs min-w-0"
        >
          <pre>{t}</pre>
        </div>
      ))}
    </div>
  );
};

export default CellKeyword;

function toPreHtml(item: any, keyword: string, attr: string): string {
  if (item[attr] && item[attr].indexOf(keyword) > -1) {
    let html = item[attr] as string;
    let htmls = html.split(keyword);
    return htmls
      .map((str, i) =>
        i == htmls.length - 1
          ? str + `<span class="bg-red-200>${keyword}</span>`
          : str
      )
      .join("");
  }
  return item[attr] || "";
}
