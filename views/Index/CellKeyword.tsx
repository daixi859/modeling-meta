import React, { useEffect, useRef } from "react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import classes from "./CellKeyword.module.scss";

import "highlight.js/styles/github.css";

hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("javascript", javascript);
type Props = {
  keyword: string;
  item: any;
};

const CellKeyword: React.FC<Props> = ({ item, keyword }) => {
  const ref = useRef<HTMLDivElement>(null);

  var arr = [
    { str: toPreHtml(item, keyword, "html"), lan: "html" },
    { str: toPreHtml(item, keyword, "script"), lan: "script" },
    { str: toPreHtml(item, keyword, "style"), lan: "style" },
  ].filter((t) => !!t.str);
  // const arr = [
  //   { str: item.html, lan: "xml" },
  //   { str: item.script, lan: "javascript" },
  //   { str: item.style, lan: "css" },
  // ]
  //   .filter((t) => !!t.str)
  //   .map((t) => {
  //     return hljs.highlight(t.str, { language: t.lan }).value;
  //   });

  return (
    <div className="flex" ref={ref}>
      {arr.map((t, i) => (
        <div key={i} className={classes.cell}>
          <pre>{t.str}</pre>
        </div>
      ))}
    </div>
  );
};

export default CellKeyword;

function toPreHtml(
  item: any,
  keyword: string,
  attr: string
): React.ReactNode[] {
  if (keyword && (item[attr] && item[attr].indexOf(keyword)) > -1) {
    let html = item[attr] as string;
    let htmls = html.split(keyword);
    return htmls.map((str, i) =>
      i !== htmls.length - 1 ? (
        <React.Fragment key={i}>
          {str}
          <span className="bg-red-200">{keyword}</span>
        </React.Fragment>
      ) : (
        str
      )
    );
  }
  return item[attr];
}
