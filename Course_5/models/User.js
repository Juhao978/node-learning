/**
 * User 模型定义
 * 
 * 使用 Sequelize 定义数据模型
 * 
 * 这就是 ORM 的核心：用 JavaScript 类表示数据库表
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 定义 User 模型
const User = sequelize.define('User', {
  // id 字段会自动创建（自增主键）
  
  name: {
    type: DataTypes.STRING(50),   // VARCHAR(50)
    allowNull: false,              // NOT NULL
    validate: {
      notEmpty: { msg: '姓名不能为空' },
      len: { args: [2, 50], msg: '姓名长度必须在2-50之间' }
    }
  },
  
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,                  // UNIQUE 约束
    validate: {
      isEmail: { msg: '邮箱格式不正确' }
    }
  },
  
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: { args: [1], msg: '年龄必须大于0' },
      max: { args: [150], msg: '年龄不能超过150' }
    }
  },
  
  role: {
    type: DataTypes.ENUM('admin', 'user', 'guest'),
    defaultValue: 'user'
  },
  
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',  // 表名
  // timestamps: true  // 已在全局配置中设置
});

module.exports = User;

/**
 * Sequelize 常用数据类型：
 * 
 * DataTypes.STRING(100)     VARCHAR(100)
 * DataTypes.TEXT            TEXT
 * DataTypes.INTEGER         INT
 * DataTypes.BIGINT          BIGINT
 * DataTypes.FLOAT           FLOAT
 * DataTypes.DOUBLE          DOUBLE
 * DataTypes.DECIMAL(10,2)   DECIMAL(10,2)
 * DataTypes.BOOLEAN         TINYINT(1)
 * DataTypes.DATE            DATETIME
 * DataTypes.DATEONLY        DATE
 * DataTypes.JSON            JSON
 * DataTypes.ENUM('a','b')   ENUM
 * DataTypes.UUID            CHAR(36)
 */

