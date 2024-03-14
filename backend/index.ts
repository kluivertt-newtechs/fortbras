import express from "express";
import { Express } from "express";

import { queryParser } from "express-query-parser";
import { bootstrap } from "./app/config/bootstrap";
import { DictRouter } from "./app/routes/dict.route";
import { FileRouter } from "./app/routes/file.route";
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 3000;
const app: Express = express();

try {
    bootstrap();
} catch (e) {
    console.error(e);
}

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET,OPTIONS,PATCH,DELETE,POST,PUT"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
    );
    app.use(cors());
    next();
});

app.use(express.json({ limit: "5000mb" }));
app.use(express.urlencoded({ limit: "5000mb" }));

app.use(
    queryParser({
        parseNull: true,
        parseUndefined: true,
        parseBoolean: true,
        parseNumber: true,
    })
);

app.get("/", (req, res) => {
    res.json({ message: "Aguardando conexões" });
});

app.use("/api/dict", DictRouter);
app.use("/api/file", FileRouter);

// const t = new DictWorker();
// t.unzip("1234", "/home/mantonelli/Sources/Clientes/Fortbrás/Fortbras.zip");

app.listen(port, async () => {
    console.log(
        `Acesse a documentação da API em http://localhost:${port}/docs`
    );
});
