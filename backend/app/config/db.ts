import { Sequelize } from "sequelize-typescript";
import { Dialect, ConnectionError } from "sequelize";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbHost = process.env.DB_HOST;
const dbDriver = process.env.DB_DRIVER as Dialect;
const dbPassword = process.env.DB_PASSWORD;

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: dbDriver,
    pool: {
        max: 10,
        min: 0,
        acquire: 10000000,
        idle: 20000
    },
    retry: {
        match: [/Deadlock/i, ConnectionError], // Retry on connection errors
        max: 3, // Maximum retry 3 times
        backoffBase: 3000, // Initial backoff duration in ms. Default: 100,
        backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
    },
    logging: process.env.LOG_QUERIES == "1" ? true : false,
});

sequelize.sync({ alter: true });
sequelize.authenticate();
