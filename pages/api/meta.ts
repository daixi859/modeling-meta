import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";

import path from "path";
const parser = new XMLParser({
  ignoreAttributes: false,
});
const metPath = "D:/workspace/company/tzgl/_metadata";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const types = ["FunctionPage", "BusinessComponent", "BusinessScript"];
  const id = req.query.id as string;
  if (!id) {
    return res.status(400).json({ msg: "请输入参数id" });
  }

  for (const type of types) {
    const files = await fs.readdir(path.join(metPath, type));

    for (const file of files) {
      if (file === id + ".metadata.config") {
        const xml = await fs.readFile(path.join(metPath, type, file), {
          encoding: "utf-8",
        });
        const obj = parser.parse(xml);
        return res.status(200).json(obj);
      }
    }
  }

  return res.status(400).json({ msg: "没找到页面" });
}
