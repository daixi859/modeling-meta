import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";

import path from "path";
import { attr2Array } from "@/utils/common";
const parser = new XMLParser({
  ignoreAttributes: false,
});
const metPath = "D:/workspace/company/tzgl/_metadata";

export type Page_ITEM = {
  filePath:string,
  filename: string;
  url: string;
  title: string;
  pageName: string;
  functionCode: string;
  name: string;
  functionPageId: string;
  createdBy: string;
  createdOn: string;
  modifiedBy: string;
  modifiedOn: string;
  apis: {
    functionCode: string;
    service: string;
    action: string;
  }[];
  dependentComponents: {
    componentGuid: string;
    dependentId: string;
  }[];
  dependentScripts: {
    scriptGuid: string;
    dependentId: string;
  }[];
  html: string;
  style: string;
  script: string;
};

const data = [] as Page_ITEM[];

let lastTime = Date.now();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (
    Date.now() - lastTime > 1000 * 60 ||
    data.length == 0 ||
    req.query.refresh
  ) {
    const dir = await fs.readdir(path.join(metPath, "FunctionPage"));
    
    for (const filename of dir) {
      const filePath = path.join(metPath, "FunctionPage", filename)
      const xml = await fs.readFile(
        filePath,
        { encoding: "utf-8" }
      );
     
      let obj = parser.parse(xml);
      obj = obj.functionPage;

      if (obj["@_pageType"] !== "6") {
        continue;
      }

      const item: Page_ITEM = {
        filePath, 
        filename,
        url: obj["@_url"],
        title: obj["@_title"],
        pageName: obj["@_pageName"],
        functionCode: obj["@_functionCode"],
        name: obj["@_name"],
        functionPageId: obj["@_functionPageId"],
        createdBy: obj["@_createdBy"],
        createdOn: obj["@_createdOn"],
        modifiedBy: obj["@_modifiedBy"],
        modifiedOn: obj["@_modifiedOn"],
        apis: attr2Array(obj, "apis", "api").map((t: any) => ({
          functionCode: t["@_functionCode"],
          service: t["@_service"],
          action: t["@_action"],
        })),
        dependentComponents: attr2Array(
          obj,
          "dependentComponents",
          "dependentComponent"
        ).map((t: any) => ({
          componentGuid: t["@_componentGuid"],
          dependentId: t["@_dependentId"],
        })),
        dependentScripts: attr2Array(
          obj,
          "dependentScripts",
          "dependentScript"
        ).map((t: any) => ({
          scriptGuid: t["@_scriptGuid"],
          dependentId: t["@_dependentId"],
        })),
        html: obj.codingPageInfo.content.layout,
        script: obj.codingPageInfo.content.script,
        style: obj.codingPageInfo.content.style.code,
      };
      data.push(item);
    }
    lastTime = Date.now();
  }

  res.status(200).json(data);
}
