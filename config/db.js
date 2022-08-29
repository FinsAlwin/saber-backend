const config = require("../config/config.json");
const mysql = require("mysql2/promise");
const { Sequelize } = require("sequelize");

module.exports = db = {};

// initialize();

async function initialize() {
  // create db if it doesn't already exist
  const { host, port, username: user, password, database } = config.development;

  console.log(user);
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

  // connect to db
  const sequelize = new Sequelize(database, user, password, {
    dialect: "mysql",
    host: host,
    define: {
      timestamps: true,
      freezeTableName: true,
    },
  });

  // init models and add them to the exported db object
  db.User = require("../model/user.model")(sequelize);
  db.Connections = require("../model/connections.model")(sequelize);
  db.Accounts = require("../model/accounts.model")(sequelize);
  db.Transactions = require("../model/transactions.model")(sequelize);
  db.CategorySaltEdge = require("../model/categorySaltEdge.model")(sequelize);
  db.SubCategorySaltEdge = require("../model/subCategorySaltEdge.model")(
    sequelize
  );
  db.UserCategory = require("../model/userCategory.model")(sequelize);

  // sync all models with database
  await sequelize.sync({ alter: true });
}
