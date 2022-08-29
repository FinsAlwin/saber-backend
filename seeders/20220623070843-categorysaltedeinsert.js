"use strict";
const db = require("../config/db");
const axios = require("axios");
require("dotenv").config();

module.exports = {
  async up(queryInterface, Sequelize) {
    const appID = process.env.SALT_EDGE_APP_ID;
    const secret = process.env.SALT_EDGE_SECRET;
    const response = await axios.get(
      `https://www.saltedge.com/api/v5/categories`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "App-id": `${appID}`,
          Secret: `${secret}`,
        },
      }
    );

    const responseData = response.data.data;

    let arr = [];
    let arr2 = [];

    for (const [x, y] of Object.entries(responseData)) {
      for (const [a, b] of Object.entries(y)) {
        arr.push({
          title: a,
          main: x,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    const Category = await db.CategorySaltEdge.findAll({});

    Category.forEach((item) => {
      for (const [x, y] of Object.entries(responseData)) {
        for (const [a, b] of Object.entries(y)) {
          if (item.title === a) {
            for (const [i, j] of Object.entries(b)) {
              arr2.push({
                category_id_salt: item.id,
                title: j,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
          }
        }
      }
    });

    var result;
    var data = await Promise.all(
      arr.map(async (item) => {
        // arr.forEach((item) => {
        const category = await db.CategorySaltEdge.findOne({
          where: {
            title: item.title,
          },
        });

        if (!category) {
          result = await queryInterface.bulkInsert(
            "CategorySaltEdge",
            [item],
            {}
          );
        }
      })
    );

    if (data) {
      var dataN = await Promise.all(
        arr2.map(async (item) => {
          // arr.forEach((item) => {
          const category = await db.CategorySaltEdge.findOne({
            where: {
              title: item.title,
            },
          });

          if (!category) {
            result = await queryInterface.bulkInsert(
              "SubCategorySaltEdge",
              [item],
              {}
            );
          }
        })
      );
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
