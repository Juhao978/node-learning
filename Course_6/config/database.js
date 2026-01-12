const { Sequelize } = require('sequelize');

// 使用本地 MySQL 数据库
const sequelize = new Sequelize('course_6', 'root', 'admin', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  logging: (sql) => console.log(`📝 SQL: ${sql}`),
  define: {
    timestamps: true,
    underscored: true
  }
});

module.exports = { sequelize };
