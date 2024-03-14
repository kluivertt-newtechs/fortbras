const swagger = require("swagger-autogen")({ language: 'pt-BR' });

import dotenv from 'dotenv';
dotenv.config();

const outputFile = "./dist/swagger-output.json";
const endpointsFiles = ['./app/routes/auth.route.ts', './app/routes/prestador.routes.ts'];

const doc = {
    host: `localhost:${process.env.PORT}`,
    definitions: {
        Token: {
            $login: "login do usuário",
            $password: "senha do usuário",
        }
    }
}

swagger(outputFile, endpointsFiles, doc).then(()=>{
    //require("./index.js") 
});