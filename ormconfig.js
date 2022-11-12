const fs = require('fs');
const SnakeNamingStrategy = require('typeorm-naming-strategies').SnakeNamingStrategy;
const secretPath = process.env.SECRET_PATH || "/run/secrets";
function readSecretFile(secret) {
  let content = fs.readFileSync(`${secretPath}/${secret}`, 'utf8');
  return content.toString();
}

// generate database connection config file
module.exports = [{
  name: 'default',
  type: "mysql",
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  username: readSecretFile(process.env.MYSQL_USERNAME),
  password: readSecretFile(process.env.MYSQL_PASSWORD),
  database: process.env.MYSQL_DATABASE,
  synchronize: false,
  logging: process.env.DEBUG == "1" ? ["error", "query", "schema"] : false,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    __dirname + "/dist/entities/**/*.js"
  ],
  migrations: [
    __dirname + "/dist/migrations/**/*.js"
  ],
  cli: {
    entitiesDir: "src/entities",
    migrationsDir: "src/migrations"
  }
}];