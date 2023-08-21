import React from "react";
import classes from "./CellKeyword.module.scss";
type Props = {
  keyword: string;
  item: any;
};

const CellKeyword: React.FC<Props> = ({ item, keyword }) => {
  var arr = [
    toPreHtml(item, keyword, "html"),
    toPreHtml(item, keyword, "script"),
    toPreHtml(item, keyword, "style"),
  ].filter(Boolean);

  return (
    <div className="flex">
      {arr.map((t, i) => (
        <div key={i} className={classes.cell}>
          <pre>{t}</pre>
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
