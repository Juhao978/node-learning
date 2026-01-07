/**
 * 数据库配置
 * 
 * Sequelize 是 Node.js 最流行的 ORM（对象关系映射）库
 * 
 * ORM 的作用：
 * - 用 JavaScript 对象操作数据库，而不是写 SQL
 * - 自动处理数据库差异（MySQL/PostgreSQL/SQLite）
 * - 提供数据验证、关联关系等功能
 * 
 * 前端类比：
 * - ORM 就像 axios，封装了底层操作
 * - Model 就像 TypeScript 的 interface，定义数据结构
 */

const { Sequelize } = require('sequelize');

// 创建 Sequelize 实例
// 本课程使用 SQLite（无需安装数据库服务器）
// 真实项目中换成 MySQL 连接字符串即可
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',  // 数据存储文件
  logging: (sql) => console.log(`📝 SQL: ${sql}`),  // 打印 SQL 语句
  define: {
    timestamps: true,  // 自动添加 createdAt, updatedAt
    underscored: true  // 使用下划线命名（user_name 而不是 userName）
  }
});

// 测试连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
  }
};

module.exports = { sequelize, testConnection };

/**
 * 如果使用 MySQL，配置如下：
 * 
 * const sequelize = new Sequelize('database', 'username', 'password', {
 *   host: 'localhost',
 *   port: 3306,
 *   dialect: 'mysql',
 *   pool: {
 *     max: 10,     // 最大连接数
 *     min: 0,      // 最小连接数
 *     idle: 10000  // 空闲连接超时时间
 *   }
 * });
 * 
 * 或使用连接字符串：
 * const sequelize = new Sequelize('mysql://user:pass@localhost:3306/dbname');
 */

