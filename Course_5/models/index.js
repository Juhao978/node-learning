/**
 * 模型索引文件 - 集中管理所有模型
 */

const { sequelize } = require('../config/database');
const User = require('./User');
const Product = require('./Product');

// 定义模型关联关系（示例）
// User.hasMany(Product);
// Product.belongsTo(User);

// 同步所有模型到数据库
const syncDatabase = async () => {
  try {
    // force: true 会删除表并重新创建（开发时使用）
    // alter: true 会修改表结构以匹配模型（谨慎使用）
    await sequelize.sync({ alter: true });
    console.log('✅ 数据库表同步完成');
  } catch (error) {
    console.error('❌ 数据库同步失败:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Product,
  syncDatabase
};

