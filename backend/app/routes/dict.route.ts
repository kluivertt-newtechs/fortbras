import { Request, Response, Router } from "express";
import { QueryTypes, where } from "sequelize";
import { sequelize } from "../config/db";
import { Queue } from "../config/queue.model";
import { ResponseModel } from "../model/response.model";
import { DictWorker } from "../worker/dict.worker";
import path from "path";
import * as fs from "fs";
import * as ExcelJS from "exceljs";
import Archiver from "archiver";
import { log } from "console";
import archiver from "archiver";
import { Sequelize } from "sequelize-typescript";

export const DictRouter = Router();

export type Dict = {
  uuid: string;
  dict: number;
  content: string;
};

DictRouter.get("/", async (req: Request, res: Response) => {
  try {
    const [results] = await sequelize.query(
      `select distinct uuid, "label"  from queue q order by "label"`,
      { raw: true }
    );

    const response: ResponseModel = {
      items: [],
      hasMore: false,
    };

    results.forEach((r: any) => {
      response.items.push(r);
    });

    res.status(200).send(response);
  } catch (error) {
    res.status(400).send(error);
  }
});

DictRouter.get("/:uuid", async (req: Request, res: Response) => {
  try {
    const result = await Queue.findAll({
      attributes: ["uuid", "id", "tabela", "status", "label"],
      where: { uuid: req.params.uuid, dict: 1, status: 1 },
      order: [["tabela", "ASC"]],
    });

    const response: ResponseModel = {
      items: [],
      hasMore: false,
    };

    for (let r of result) {
      try {
        if ((r.get("tabela") as string).startsWith("SX4")) {
          continue;
        }

        const v: any = {
          uuid: r.get("uuid"),
          tabela: r.get("tabela"),
          status: r.get("status"),
          label: r.get("label"),
          fields: [],
        };

        response.items.push(v);
      } catch (error) {
        // FIXME: Existem tabelas que não estão sendo processadas
        continue;
      }
    }

    res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

DictRouter.get("/diff/:tabela/:uuid", async (req: Request, res: Response) => {
  const tabela = req.params["tabela"];
  const uuid = req.params["uuid"];

  const response: ResponseModel = {
    items: [],
    hasMore: false,
  };

  try {
    const [results_dict1] = await sequelize.query(
      `select * from ${tabela} where uuid = '${uuid}' and dict = 1 and diff is not null `,
      { raw: true }
    );
    for (let o of results_dict1) {
      cleanObject(o);
    }

    const [result_conf1] = await sequelize.query(
      `select * from queue where uuid = '${uuid}' and tabela = '${tabela}' and dict = 2 limit 1`,
      { raw: true }
    );

    if (result_conf1.length == 0) {
      const diffs: any = {
        dict1: [],
        dict2: [],
      };
      diffs.dict1.message = "Tabela não encontrada no dicionário 2";
      response.items.push(diffs);
    } else {
      for (let i = 0; i < results_dict1.length; i++) {
        const reg: any = results_dict1[i];
        const diffs: any = {
          dict1: [],
          dict2: [],
        };

        let queryDiff = `select * from ${tabela} where uuid = '${uuid}' and dict = 2 and diff = ${reg["diff"]} `;

        const [results_dict2] = await sequelize.query(queryDiff, { raw: true });

        if (results_dict2.length == 0) {
          cleanObject(reg);
          diffs.dict1.push(prepareObject(reg));
        } else {
          for (let o of results_dict2) {
            cleanObject(o);
          }
          for (let o of results_dict2) {
            if (!compareObjects(reg, o)) {
              diffs.dict1.push(prepareObject(reg));
              diffs.dict2.push(prepareObject(o));
            }
          }
        }

        if (diffs.dict1.length > 0 || diffs.dict2.length > 0) {
          response.items.push(diffs);
        }
      }
    }

    const [results_dict3] = await sequelize.query(
      `select * from ${tabela} where uuid = '${uuid}' and dict = 2 and diff is not null `,
      { raw: true }
    );
    for (let o of results_dict1) {
      cleanObject(o);
    }

    const [result_conf2] = await sequelize.query(
      `select * from queue where uuid = '${uuid}' and tabela = '${tabela}' and dict = 1 limit 1`,
      { raw: true }
    );

    if (result_conf2.length == 0) {
      const diffs: any = {
        dict1: [],
        dict2: [],
      };
      diffs.dict2.message = "Tabela não encontrada no dicionário 1";
      response.items.push(diffs);
    } else {
      for (let i = 0; i < results_dict3.length; i++) {
        const reg: any = results_dict3[i];
        const diffs: any = {
          dict1: [],
          dict2: [],
        };

        let queryDiff = `select * from ${tabela} where uuid = '${uuid}' and dict = 1 and diff = ${reg["diff"]} `;

        const [results_dict4] = await sequelize.query(queryDiff, { raw: true });

        if (results_dict4.length == 0) {
          cleanObject(reg);
          diffs.dict2.push(prepareObject(reg));
        }

        if (diffs.dict1.length > 0 || diffs.dict2.length > 0) {
          response.items.push(diffs);
        }
      }
    }

    res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

/* DictRouter.get("/fields/:uuid/:tabela", async (req: Request, res: Response) => {
    try {
        const [results] = await sequelize.query(
            `select * from "${req.params["tabela"]}" where uuid = '${req.params["uuid"]}' limit 1 `,
            { raw: true }
        );

        const response: ResponseModel = {
            items: [],
            hasMore: false,
        };

        for (let r of results) {
            try {
                const v: any = {
                    fields: [],
                };
                for (let f of Object.keys(results[0] as any)) {
                    if (
                        f == "id" ||
                        f == "uuid" ||
                        f == "dict" ||
                        f == "type" ||
                        f == "d_e_l_e_t_" ||
                        f == "r_e_c_d_e_l_" ||
                        f == "r_e_c_n_o_" ||
                        f == "created_at" ||
                        f == "updated_at" ||
                        f == "deleted_at"
                    ) {
                        continue;
                    }

                    const value: any = {
                        label: f,
                        diffs: {},
                    };

                    const [results] = await sequelize.query(
                        `select * from "${req.params["tabela"]}" where uuid = '${req.params["uuid"]}' and dict = 1`,
                        { raw: true }
                    );
                    value.diffs.dict1 = results;

                    v.fields.push(value);
                }

                response.items.push(v);
            } catch (error) {
                console.error(error);
                // FIXME: Existem tabelas que não estão sendo processadas
                continue;
            }
        }

        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
}); */

DictRouter.get("/export/:uuid", async (req: Request, res: Response) => {
  const uuid = req.params.uuid;
  const path = require("path");
  const AdmZip = require("adm-zip");
  try {
    const result = await Queue.findAll({
      attributes: ["uuid", "tabela"],
      group: ["uuid", "tabela"],
      where: { uuid: req.params.uuid },
      order: [["tabela", "ASC"]],
    });

    const response: any = {
      items: [],
      hasMore: false,
    };

    const exportPath = path.join("C:\\fortbras", "exportacao");
    if (!fs.existsSync(exportPath)) {
      fs.mkdirSync(exportPath, { recursive: true });
    }
    var zip = new AdmZip();
    const zipName = `exported_files_${uuid}.zip`;
    const zipPath = path.join(exportPath, zipName);

    if (fs.existsSync(zipPath)) {
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename=${zipName}`);
      return res.sendFile(zipPath);
    }

    for (const dataT of result) {
      if (!dataT) {
        continue;
      }
      const data: any = {
        tabela: dataT.getDataValue("tabela"),
        uuid: dataT.getDataValue("uuid"),
      };

      const [results_dict1] = await sequelize.query(
        `select * from ${data.tabela} where uuid = '${uuid}' and dict = 1 and diff is not null `,
        { raw: true }
      );
      for (let o of results_dict1) {
        cleanObject(o);
      }

      for (let i = 0; i < results_dict1.length; i++) {
        const reg: any = results_dict1[i];
        const diffs: any = {
          dict1: [],
          dict2: [],
        };

        let queryDiff = `select * from ${data.tabela} where uuid = '${uuid}' and dict = 2 and diff = ${reg["diff"]} `;

        const [results_dict2] = await sequelize.query(queryDiff, { raw: true });

        if (results_dict2.length == 0) {
          cleanObject(reg);
          diffs.dict1.push(prepareObject(reg));
        } else {
          for (let o of results_dict2) {
            cleanObject(o);
          }
          for (let o of results_dict2) {
            if (!compareObjects(reg, o)) {
              diffs.dict1.push(prepareObject(reg));
              diffs.dict2.push(prepareObject(o));
            }
          }
        }

        if (diffs.dict1.length > 0 || diffs.dict2.length > 0) {
          response.items.push(diffs);
        }
      }

      const [results_dict3] = await sequelize.query(
        `select * from ${data.tabela} where uuid = '${uuid}' and dict = 2 and diff is not null `,
        { raw: true }
      );
      for (let o of results_dict1) {
        cleanObject(o);
      }

      for (let i = 0; i < results_dict3.length; i++) {
        const reg: any = results_dict3[i];
        const diffs: any = {
          dict1: [],
          dict2: [],
        };

        let queryDiff = `select * from ${data.tabela} where uuid = '${uuid}' and dict = 1 and diff = ${reg["diff"]} `;

        const [results_dict4] = await sequelize.query(queryDiff, { raw: true });

        if (results_dict4.length == 0) {
          cleanObject(reg);
          diffs.dict2.push(prepareObject(reg));
        }

        if (diffs.dict1.length > 0 || diffs.dict2.length > 0) {
          response.items.push(diffs);
        }
      }

      console.dir(response);
      // gravação dos arquivos

      if (response.items.length == 0) {
        continue;
      }

      const filePath = path.join(
        exportPath,
        `analise_${dataT.get("tabela")}.xlsx`
      );
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Analise`);

      for (let i = 0; i < response.items.length; i++) {
        const item = response.items[i];

        if (item.dict1.length > 0 || item.dict2.length > 0) {
          if (i == 0) {
            const firstDict1Data = item.dict1[0]?.data || {};
            const firstDict2Data = item.dict2[0]?.data || {};
            const allHeaders = new Set([
              "tabela",
              "dicionario",
              "diferenca",
              ...Object.keys(firstDict1Data),
              ...Object.keys(firstDict2Data),
            ]);
            const headerRow = worksheet.addRow([...allHeaders]);
            headerRow.eachCell((cell) => {
              cell.font = { bold: true };
            });
          }
        }
        for (const dictData of item.dict1) {
          const data = dictData.data;
          const rowData = [];
          rowData.push(item.tabela);
          rowData.push(1);
          rowData.push(i + 1);
          for (let k of Object.keys(data)) {
            rowData.push(data[k]);
          }
          worksheet.addRow(rowData);
        }
        for (const dictData of item.dict2) {
          const data = dictData.data;
          const rowData = [];
          rowData.push(item.tabela);
          rowData.push(2);
          rowData.push(i + 1);
          for (let k of Object.keys(data)) {
            rowData.push(data[k]);
          }
          worksheet.addRow(rowData);
        }
      }
      await workbook.xlsx.writeFile(filePath);
      zip.addLocalFile(filePath);

      response.items = [];
    }

    if (!fs.existsSync(exportPath)) {
      fs.mkdirSync(exportPath, { recursive: true });
    }

    zip.writeZip(zipPath, (err: any) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Erro ao salvar o arquivo ZIP");
      }
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename=${zipName}`);
      res.sendFile(zipPath);
    });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(400).send("Erro ao processar a solicitação");
    }
  }
});

DictRouter.post("/", async (req: Request, res: Response) => {
  const fs = require("node:fs");

  try {
    const uid = req.body.uuid;
    fs.writeFileSync(
      `uploads/${uid}_${req.body.files[0].file_name}`,
      req.body.files[0].base64,
      { encoding: "base64" }
    );

    const dictw = new DictWorker();
    dictw.unzip(
      uid,
      req.body.files[0].dict,
      `uploads/${uid}_${req.body.files[0].file_name}`
    );

    res.status(200).send({ message: "Arquivos recebidos" });
  } catch (error) {
    res.status(400).send(error);
    console.error(error);
  }
});

DictRouter.delete("/:uuid", async (req, res) => {
  const uuid = req.params.uuid;
  try {
    const result = await Queue.findAll({
      attributes: ["uuid", "tabela"],
      group: ["uuid", "tabela"],
      where: { uuid: req.params.uuid },
      order: [["tabela", "ASC"]],
    });

    for (let item of result) {
      if (!item) {
        continue;
      }
      const tableName = (item.get("tabela") as string).toLowerCase();
      if (tableName) {
        // await sequelize.query(`DELETE FROM "${tableName}" WHERE uuid = :uuid`, {
        //   replacements: { uuid: uuid },
        //   type: QueryTypes.DELETE,
        // });

        await sequelize.query(`DROP TABLE IF EXISTS "${tableName}"`, {
          type: QueryTypes.DELETE,
        });
      }
    }

    await Queue.destroy({
      where: { uuid: uuid },
    });

    res.status(200).send({ message: "Registros deletados com sucesso." });
  } catch (error) {
    res.status(400).send(error);
    console.error(error);
  }
});

//================================================
function compareObjects(obj1: any, obj2: any) {
  const chaves1 = Object.keys(obj1);
  const chaves2 = Object.keys(obj2);

  if (chaves1.length !== chaves2.length) {
    return false;
  }

  for (const chave of chaves1) {
    if (obj1[chave].trim() !== obj2[chave].trim()) {
      return false;
    }
  }

  return true;
}

function cleanObject(obj: any) {
  for (let f of Object.keys(obj)) {
    if (
      f == "id" ||
      f == "uuid" ||
      f == "dict" ||
      f == "type" ||
      f == "d_e_l_e_t_" ||
      f == "r_e_c_d_e_l_" ||
      f == "r_e_c_n_o_" ||
      f == "created_at" ||
      f == "updated_at" ||
      f == "deleted_at"
    ) {
      delete obj[f as any];
    } else {
      obj[f as any] = new String(obj[f as any] || "").trim();
    }
  }
}

function prepareObject(obj: any) {
  const v: any = {
    properties: [],
    data: {},
  };
  for (let f of Object.keys(obj)) {
    v.properties.push({ property: f, label: f.toUpperCase() });
  }
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      v.data[key] = obj[key].split("_").join("_\n");
    }
  }

  return v;
}
