import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";

import path from "path";
import { attr2Array } from "@/utils/common";
const parser = new XMLParser({
  ignoreAttributes: false,
});
const metaPath = process.env.metaPath || "";

export type Page_ITEM = {
  filePath: string;
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

let pageData = [] as Page_ITEM[];
let compData = [] as any[];
let scriptData = [] as any[];
let loaded = false;
let lastTime = Date.now();
let functionGUID2Code: Record<string, string> = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (Date.now() - lastTime > 1000 * 60 || !loaded || req.query.refresh) {
    pageData = await getPageData();
    compData = await getComponentData();
    scriptData = await getScriptData();
    lastTime = Date.now();
  }
  loaded = true;
  res.status(200).json({ pageData, compData, scriptData });
}

async function getScriptData() {
  const scriptData: any[] = [];
  const dir = await fs.readdir(path.join(metaPath, "BusinessScript"));

  for (const filename of dir) {
    if (filename.indexOf("metadata.config") === -1) {
      continue;
    }
    const filePath = path.join(metaPath, "BusinessScript", filename);
    const xml = await fs.readFile(filePath, { encoding: "utf-8" });

    let obj = parser.parse(xml);
    obj = obj.businessScript;

    const item: any = {
      filePath,
      filename,
      scriptName: obj["@_scriptName"],
      functionGuid: obj["@_functionGuid"],
      scriptId: obj["@_scriptId"],
      functionCode: functionGUID2Code[obj["@_functionGuid"]],
      scriptGuid: obj["@_scriptGuid"],
      createdBy: obj["@_createdBy"],
      createdOn: obj["@_createdOn"],
      modifiedBy: obj["@_modifiedBy"],
      modifiedOn: obj["@_modifiedOn"],
      script: obj.scriptContent,
    };
    scriptData.push(item);
  }
  return scriptData;
}

async function getComponentData() {
  const compData = [];
  const dir = await fs.readdir(path.join(metaPath, "BusinessComponent"));
  for (const filename of dir) {
    if (filename.indexOf("metadata.config") === -1) {
      continue;
    }
    const filePath = path.join(metaPath, "BusinessComponent", filename);
    const xml = await fs.readFile(filePath, { encoding: "utf-8" });

    let obj = parser.parse(xml);
    obj = obj.businessComponent;

    if (obj["@_type"] !== "3") {
      continue;
    }

    const item = {
      filePath,
      filename,
      createdBy: obj["@_createdBy"],
      createdOn: obj["@_createdOn"],
      modifiedBy: obj["@_modifiedBy"],
      modifiedOn: obj["@_modifiedOn"],
      componentName: obj["@_componentName"],
      componentId: obj["@_componentId"],
      componentGuid: obj["@_componentGuid"],
      functionGuid: obj["@_functionGuid"],
      functionCode: functionGUID2Code[obj["@_functionGuid"]],
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
      childComponents: attr2Array(obj, "childComponents", "childComponent").map(
        (t: any) => ({
          html: t.componentInfo.content.layout,
          script: t.componentInfo.content.script,
          style: t.componentInfo.content.style.code,
          componentName: t["@_componentName"],
          componentId: t["@_componentId"],
        })
      ),
      html: obj.componentInfo.content.layout,
      script: obj.componentInfo.content.script,
      style: obj.componentInfo.content.style.code,
    };
    compData.push(item);
  }
  return compData;
}

async function getPageData() {
  const pageData: Page_ITEM[] = [];
  const dir = await fs.readdir(path.join(metaPath, "FunctionPage"));

  for (const filename of dir) {
    if (filename.indexOf("metadata.config") === -1) {
      continue;
    }
    const filePath = path.join(metaPath, "FunctionPage", filename);
    const xml = await fs.readFile(filePath, { encoding: "utf-8" });

    let obj = parser.parse(xml);
    obj = obj.functionPage;

    if (obj["@_pageType"] !== "6") {
      continue;
    }
    functionGUID2Code[obj["@_functionGUID"]] = obj["@_functionCode"];
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
    pageData.push(item);
  }
  return pageData;
}
