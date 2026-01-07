const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './blog.sqlite',
  logging: false,
  define: {
    timestamps: true,
    underscored: true
  }
});

module.exports = { sequelize };

