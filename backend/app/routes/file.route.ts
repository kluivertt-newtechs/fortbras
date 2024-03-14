import { Request, Response, Router } from 'express';
import * as parser from '../parser/file.parser';
import { sequelize } from '../config/db';
import { ResponseModel } from '../model/response.model';
import { Source } from '../config/source.model';
import { SourceFunction } from '../config/source-function.model';
import { SourceTable, SourceTableField } from '../config/source-table.model';

export const FileRouter = Router();

FileRouter.get('/', async (req: Request, res: Response) => {
  try {
    const [results] = await sequelize.query(
      `select distinct uuid, "label" from source q order by "label"`,
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

FileRouter.get('/:uuid', async (req: Request, res: Response) => {
  try {
    const result = await Source.findAll({
      attributes: ['uuid', 'id', 'category', 'name'],
      where: { uuid: req.params.uuid },
      order: [
        ['category', 'ASC'],
        ['name', 'ASC'],
      ],
      include: [SourceFunction, SourceTable],
    });

    const response: ResponseModel = {
      items: [],
      hasMore: false,
    };

    for (let r of result) {
      try {
        const v: any = {
          id: r.get('id'),
          uuid: r.get('uuid'),
          category: r.get('category'),
          name: r.get('name'),
          functions: r.get('SourceFunctions'),
          tables: r.get('SourceTables'),
        };

        response.items.push(v);
      } catch (error) {
        continue;
      }
    }

    res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

FileRouter.get('/detail/:uuid/:id', async (req: Request, res: Response) => {
  try {
    const result = await Source.findOne({
      where: { uuid: req.params.uuid, id: req.params.id },
      include: [SourceFunction, SourceTable],
    });

    const response: ResponseModel = {
      items: [],
      hasMore: false,
    };

    if (result) {
      try {
        const v: any = {
          id: result.get('id'),
          uuid: result.get('uuid'),
          category: result.get('category'),
          name: result.get('name'),
          source: result.get('source'),
          functions: result.get('SourceFunctions'),
          tables: result.get('SourceTables'),
        };

        for (const t of v.tables) {
          const fields = await SourceTableField.findAll({
            where: { SourceTableId: t.id },
          });
          t.dataValues.fields = [];
          for (const f of fields) {
            t.dataValues.fields.push(f.get('name'));
          }
        }

        // console.dir(v);

        response.items.push(v);
      } catch (error) {}
    }

    res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

FileRouter.post('/', async (req: Request, res: Response) => {
  const fs = require('node:fs');

  try {
    const uid = req.body.uuid;
    fs.writeFileSync(
      `uploads/${uid}_${req.body.files[0].file_name}`,
      req.body.files[0].base64,
      { encoding: 'base64' }
    );

    await parser.unzip(uid, `uploads/${uid}_${req.body.files[0].file_name}`);
    /* const dictw = new DictWorker();
        dictw.unzip(
            uid,
            req.body.files[0].dict,
            `uploads/${uid}_${req.body.files[0].file_name}`
        ); */

    res.status(200).send({ message: 'Arquivos recebidos' });
  } catch (error) {
    res.status(400).send(error);
    console.error(error);
  }
});

FileRouter.delete('/:uuid', async (req, res) => {
  try {
    await sequelize.query('truncate "source" cascade;');

    res.status(200).send({ message: 'Registros deletados com sucesso.' });
  } catch (error) {
    res.status(400).send(error);
    console.error(error);
  }
});
