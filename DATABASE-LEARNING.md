# 数据库学习指南（前端开发者视角）

> 🎯 本文专为前端开发者编写，用熟悉的概念类比帮助你快速理解数据库

---

## 📚 目录

1. [数据库是什么](#1-数据库是什么)
2. [SQL 基础语法](#2-sql-基础语法)
3. [Sequelize ORM 入门](#3-sequelize-orm-入门)
4. [SQL vs Sequelize 对照表](#4-sql-vs-sequelize-对照表)
5. [数据类型对照](#5-数据类型对照)
6. [查询操作详解](#6-查询操作详解)
7. [关联关系](#7-关联关系)
8. [事务处理](#8-事务处理)
9. [性能优化](#9-性能优化)
10. [最佳实践](#10-最佳实践)

---

## 1. 数据库是什么

### 🎯 前端类比

| 前端概念 | 数据库概念 | 说明 |
|---------|-----------|------|
| localStorage | 数据库 | 持久化存储数据的地方 |
| JSON 对象 | 表（Table） | 存储同类数据的容器 |
| 对象的 key | 字段（Column） | 数据的属性名 |
| 数组中的一项 | 记录/行（Row） | 一条完整的数据 |
| TypeScript interface | 表结构（Schema） | 定义数据的类型和约束 |

### 为什么需要数据库？

```javascript
// ❌ 前端存储的问题
localStorage.setItem('users', JSON.stringify(users));
// 1. 数据量大时性能差
// 2. 无法高效查询
// 3. 多用户无法共享
// 4. 浏览器清缓存就丢失

// ✅ 数据库的优势
// 1. 高效存储和查询海量数据
// 2. 支持复杂的条件筛选
// 3. 多用户并发访问
// 4. 数据持久化安全存储
```

### 常见数据库类型

| 类型 | 代表产品 | 特点 | 使用场景 |
|-----|---------|------|---------|
| 关系型 | MySQL, PostgreSQL | 表格结构，支持 SQL | 大多数业务系统 |
| 文档型 | MongoDB | JSON 文档，灵活 | 内容管理、日志 |
| 键值型 | Redis | 内存存储，极快 | 缓存、会话 |
| 图数据库 | Neo4j | 节点和关系 | 社交网络、推荐 |

**本教程重点**：MySQL（最流行的关系型数据库）

---

## 2. SQL 基础语法

### 2.1 什么是 SQL？

**SQL**（Structured Query Language）是操作关系型数据库的标准语言。

```
SQL 之于数据库 = JavaScript 之于浏览器
```

### 2.2 数据库和表操作

```sql
-- 创建数据库
CREATE DATABASE my_app CHARACTER SET utf8mb4;

-- 使用数据库
USE my_app;

-- 创建表（类似定义 TypeScript interface）
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,  -- 主键，自增
  name VARCHAR(50) NOT NULL,          -- 字符串，不能为空
  email VARCHAR(100) UNIQUE,          -- 唯一约束
  age INT DEFAULT 0,                  -- 默认值
  role ENUM('admin', 'user') DEFAULT 'user',  -- 枚举
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 查看表结构
DESCRIBE users;

-- 删除表
DROP TABLE users;
```

### 2.3 CRUD 操作

#### Create - 插入数据

```sql
-- 插入单条
INSERT INTO users (name, email, age) VALUES ('张三', 'zhang@example.com', 25);

-- 插入多条
INSERT INTO users (name, email, age) VALUES 
  ('李四', 'li@example.com', 30),
  ('王五', 'wang@example.com', 28);
```

#### Read - 查询数据

```sql
-- 查询所有
SELECT * FROM users;

-- 查询指定字段
SELECT name, email FROM users;

-- 条件查询
SELECT * FROM users WHERE age > 25;

-- 模糊查询
SELECT * FROM users WHERE name LIKE '%张%';

-- 排序
SELECT * FROM users ORDER BY created_at DESC;

-- 分页（跳过10条，取10条）
SELECT * FROM users LIMIT 10 OFFSET 10;

-- 统计
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM users WHERE role = 'admin';
```

#### Update - 更新数据

```sql
-- 更新单个字段
UPDATE users SET age = 26 WHERE id = 1;

-- 更新多个字段
UPDATE users SET name = '张三丰', age = 100 WHERE id = 1;

-- 批量更新
UPDATE users SET role = 'user' WHERE role IS NULL;
```

#### Delete - 删除数据

```sql
-- 删除指定记录
DELETE FROM users WHERE id = 1;

-- 批量删除
DELETE FROM users WHERE age < 18;

-- 清空表（保留表结构）
TRUNCATE TABLE users;
```

### 2.4 条件查询运算符

```sql
-- 比较运算符
WHERE age = 25       -- 等于
WHERE age != 25      -- 不等于
WHERE age > 25       -- 大于
WHERE age >= 25      -- 大于等于
WHERE age < 25       -- 小于
WHERE age <= 25      -- 小于等于

-- 范围查询
WHERE age BETWEEN 18 AND 30    -- 18 到 30 之间
WHERE age IN (18, 25, 30)      -- 在列表中

-- 空值判断
WHERE email IS NULL            -- 是空
WHERE email IS NOT NULL        -- 不为空

-- 逻辑运算
WHERE age > 18 AND role = 'user'   -- 与
WHERE age < 18 OR age > 60         -- 或
WHERE NOT (age > 18)               -- 非

-- 模糊匹配
WHERE name LIKE '张%'    -- 以"张"开头
WHERE name LIKE '%三'    -- 以"三"结尾
WHERE name LIKE '%小%'   -- 包含"小"
```

---

## 3. Sequelize ORM 入门

### 3.1 什么是 ORM？

**ORM**（Object-Relational Mapping）让你用 JavaScript 对象操作数据库，无需写 SQL。

```javascript
// 传统方式：写 SQL
const sql = "SELECT * FROM users WHERE age > 18";
const users = await connection.query(sql);

// ORM 方式：写 JavaScript
const users = await User.findAll({
  where: { age: { [Op.gt]: 18 } }
});
```

### 🎯 前端类比

```
ORM 之于 SQL = Axios 之于 fetch
```

| 底层 | 封装层 | 优势 |
|-----|-------|-----|
| 原生 fetch | Axios | 拦截器、自动转换 |
| 原生 SQL | Sequelize | 类型安全、跨数据库 |

### 3.2 安装和连接

```bash
pnpm add sequelize mysql2
```

```javascript
const { Sequelize } = require('sequelize');

// 方式1：参数形式
const sequelize = new Sequelize('数据库名', '用户名', '密码', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  logging: console.log,  // 打印 SQL
  pool: {
    max: 10,    // 最大连接数
    min: 0,     // 最小连接数
    idle: 10000 // 空闲超时
  }
});

// 方式2：连接字符串
const sequelize = new Sequelize('mysql://user:pass@localhost:3306/dbname');

// 测试连接
await sequelize.authenticate();
console.log('数据库连接成功');
```

### 3.3 定义模型

```javascript
const { DataTypes } = require('sequelize');

// 定义 User 模型（对应 users 表）
const User = sequelize.define('User', {
  // 字段定义
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '用户名'
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    validate: {
      isEmail: { msg: '邮箱格式不正确' }
    }
  },
  age: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: '年龄不能小于0' },
      max: { args: [150], msg: '年龄不能大于150' }
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'users',    // 指定表名
  timestamps: true,      // 自动添加 createdAt, updatedAt
  underscored: true,     // 使用下划线命名 (created_at)
  paranoid: true         // 软删除（添加 deletedAt）
});
```

### 🎯 前端类比

这就像 TypeScript 的 interface + 验证：

```typescript
// TypeScript interface
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  role: 'admin' | 'user';
}

// Sequelize 模型 = interface + 验证 + 数据库映射
```

### 3.4 同步数据库

```javascript
// 同步所有模型到数据库
await sequelize.sync();            // 不存在则创建表
await sequelize.sync({ force: true });  // 删除并重建（会丢数据！）
await sequelize.sync({ alter: true });  // 修改表结构
```

---

## 4. SQL vs Sequelize 对照表

### 4.1 查询操作

| 操作 | SQL | Sequelize |
|-----|-----|-----------|
| 查询所有 | `SELECT * FROM users` | `User.findAll()` |
| 查询单条 | `SELECT * FROM users WHERE id = 1` | `User.findByPk(1)` |
| 条件查询 | `SELECT * FROM users WHERE age > 18` | `User.findAll({ where: { age: { [Op.gt]: 18 } } })` |
| 查询首条 | `SELECT * FROM users LIMIT 1` | `User.findOne()` |
| 统计数量 | `SELECT COUNT(*) FROM users` | `User.count()` |

### 4.2 创建操作

| 操作 | SQL | Sequelize |
|-----|-----|-----------|
| 插入单条 | `INSERT INTO users (name) VALUES ('张三')` | `User.create({ name: '张三' })` |
| 批量插入 | `INSERT INTO users (name) VALUES ('张三'), ('李四')` | `User.bulkCreate([{ name: '张三' }, { name: '李四' }])` |
| 存在则更新 | `INSERT ... ON DUPLICATE KEY UPDATE` | `User.upsert({ ... })` |

### 4.3 更新操作

| 操作 | SQL | Sequelize |
|-----|-----|-----------|
| 更新记录 | `UPDATE users SET name = '张三' WHERE id = 1` | `User.update({ name: '张三' }, { where: { id: 1 } })` |
| 实例更新 | - | `user.name = '张三'; await user.save()` |
| 自增 | `UPDATE users SET age = age + 1` | `User.increment('age', { where: { id: 1 } })` |

### 4.4 删除操作

| 操作 | SQL | Sequelize |
|-----|-----|-----------|
| 删除记录 | `DELETE FROM users WHERE id = 1` | `User.destroy({ where: { id: 1 } })` |
| 实例删除 | - | `user.destroy()` |
| 清空表 | `TRUNCATE TABLE users` | `User.destroy({ truncate: true })` |

---

## 5. 数据类型对照

### 5.1 Sequelize 数据类型

| Sequelize | MySQL | JavaScript | 说明 |
|-----------|-------|------------|------|
| `STRING` | VARCHAR(255) | string | 短字符串 |
| `STRING(100)` | VARCHAR(100) | string | 指定长度 |
| `TEXT` | TEXT | string | 长文本 |
| `INTEGER` | INT | number | 整数 |
| `BIGINT` | BIGINT | bigint | 大整数 |
| `FLOAT` | FLOAT | number | 浮点数 |
| `DECIMAL(10,2)` | DECIMAL(10,2) | string | 精确小数（金额用） |
| `BOOLEAN` | TINYINT(1) | boolean | 布尔值 |
| `DATE` | DATETIME | Date | 日期时间 |
| `DATEONLY` | DATE | string | 仅日期 |
| `JSON` | JSON | object | JSON 对象 |
| `ENUM('a','b')` | ENUM | string | 枚举值 |
| `UUID` | CHAR(36) | string | UUID |

### 5.2 使用示例

```javascript
const { DataTypes } = require('sequelize');

const Product = sequelize.define('Product', {
  name: DataTypes.STRING,                    // VARCHAR(255)
  description: DataTypes.TEXT,               // TEXT
  price: DataTypes.DECIMAL(10, 2),           // DECIMAL(10,2)
  stock: DataTypes.INTEGER,                  // INT
  isActive: DataTypes.BOOLEAN,               // TINYINT(1)
  category: DataTypes.ENUM('食品', '电子', '服装'),
  metadata: DataTypes.JSON,                  // JSON
  releaseDate: DataTypes.DATEONLY            // DATE
});
```

---

## 6. 查询操作详解

### 6.1 基础查询

```javascript
const { Op } = require('sequelize');

// 查询所有
const users = await User.findAll();

// 根据主键查询
const user = await User.findByPk(1);

// 条件查询第一条
const user = await User.findOne({
  where: { email: 'test@example.com' }
});

// 查询或创建
const [user, created] = await User.findOrCreate({
  where: { email: 'test@example.com' },
  defaults: { name: '新用户' }
});
```

### 6.2 查询操作符

```javascript
const { Op } = require('sequelize');

// 比较操作符
User.findAll({
  where: {
    age: { [Op.gt]: 18 },      // > 18
    age: { [Op.gte]: 18 },     // >= 18
    age: { [Op.lt]: 60 },      // < 60
    age: { [Op.lte]: 60 },     // <= 60
    age: { [Op.ne]: 25 },      // != 25
    age: { [Op.eq]: 25 },      // = 25
  }
});

// 范围操作符
User.findAll({
  where: {
    age: { [Op.between]: [18, 60] },      // BETWEEN 18 AND 60
    age: { [Op.notBetween]: [18, 60] },   // NOT BETWEEN
    role: { [Op.in]: ['admin', 'user'] }, // IN ('admin', 'user')
    role: { [Op.notIn]: ['guest'] },      // NOT IN
  }
});

// 模糊查询
User.findAll({
  where: {
    name: { [Op.like]: '%张%' },        // LIKE '%张%'
    name: { [Op.startsWith]: '张' },    // LIKE '张%'
    name: { [Op.endsWith]: '三' },      // LIKE '%三'
    name: { [Op.substring]: '小' },     // LIKE '%小%'
  }
});

// 空值判断
User.findAll({
  where: {
    email: { [Op.is]: null },           // IS NULL
    email: { [Op.not]: null },          // IS NOT NULL
  }
});

// 逻辑操作符
User.findAll({
  where: {
    [Op.and]: [
      { age: { [Op.gt]: 18 } },
      { role: 'user' }
    ],
    [Op.or]: [
      { name: '张三' },
      { name: '李四' }
    ]
  }
});
```

### 6.3 选择字段

```javascript
// 只查询指定字段
const users = await User.findAll({
  attributes: ['id', 'name', 'email']
});

// 排除某些字段
const users = await User.findAll({
  attributes: { exclude: ['password'] }
});

// 字段别名
const users = await User.findAll({
  attributes: [
    'id',
    ['name', 'userName'],  // name AS userName
    [sequelize.fn('COUNT', sequelize.col('id')), 'total']  // 聚合
  ]
});
```

### 6.4 排序和分页

```javascript
// 排序
const users = await User.findAll({
  order: [
    ['createdAt', 'DESC'],    // 按创建时间降序
    ['name', 'ASC']           // 按名字升序
  ]
});

// 分页
const users = await User.findAll({
  limit: 10,    // 每页数量
  offset: 20    // 跳过数量（第3页）
});

// 分页 + 总数
const { count, rows } = await User.findAndCountAll({
  where: { role: 'user' },
  limit: 10,
  offset: 0
});
// count: 总记录数
// rows: 当前页数据
```

### 6.5 聚合查询

```javascript
// 计数
const count = await User.count();
const adminCount = await User.count({ where: { role: 'admin' } });

// 求和
const totalAge = await User.sum('age');

// 最大/最小
const maxAge = await User.max('age');
const minAge = await User.min('age');

// 分组统计
const stats = await User.findAll({
  attributes: [
    'role',
    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
  ],
  group: ['role']
});
// 结果: [{ role: 'admin', count: 5 }, { role: 'user', count: 100 }]
```

---

## 7. 关联关系

### 7.1 关联类型

| 类型 | 说明 | 示例 |
|-----|------|------|
| `hasOne` | 一对一（拥有） | 用户有一个个人资料 |
| `belongsTo` | 一对一（属于） | 个人资料属于用户 |
| `hasMany` | 一对多 | 用户有多篇文章 |
| `belongsToMany` | 多对多 | 文章有多个标签 |

### 7.2 一对多关系

```javascript
// 用户有多篇文章
// models/User.js
User.hasMany(Post, {
  foreignKey: 'userId',
  as: 'posts'
});

// 文章属于用户
// models/Post.js
Post.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author'
});

// 查询用户及其文章
const user = await User.findByPk(1, {
  include: [{
    model: Post,
    as: 'posts'
  }]
});

// 查询文章及其作者
const post = await Post.findByPk(1, {
  include: [{
    model: User,
    as: 'author',
    attributes: ['id', 'name']  // 只取部分字段
  }]
});
```

### 7.3 多对多关系

```javascript
// 文章和标签（多对多）
Post.belongsToMany(Tag, {
  through: 'post_tags',  // 中间表
  foreignKey: 'postId',
  as: 'tags'
});

Tag.belongsToMany(Post, {
  through: 'post_tags',
  foreignKey: 'tagId',
  as: 'posts'
});

// 查询文章及其标签
const post = await Post.findByPk(1, {
  include: [{ model: Tag, as: 'tags' }]
});

// 给文章添加标签
await post.addTags([tag1, tag2]);

// 设置文章标签（替换）
await post.setTags([tag1, tag2, tag3]);

// 移除标签
await post.removeTags([tag1]);
```

### 🎯 前端类比

这类似于 Vue/React 中的组件关系：

```javascript
// 前端组件关系
<UserProfile>
  <PostList :posts="user.posts" />  // 一对多
</UserProfile>

// 后端关联查询
const user = await User.findByPk(1, {
  include: ['posts']  // 自动加载关联数据
});
```

---

## 8. 事务处理

### 8.1 什么是事务？

事务确保多个数据库操作**要么全部成功，要么全部失败**。

```
转账场景：A 转 100 元给 B
1. A 账户 -100
2. B 账户 +100

如果第 2 步失败，第 1 步也要回滚！
```

### 8.2 使用事务

```javascript
const { sequelize } = require('./config/database');

// 方式1：自动管理
await sequelize.transaction(async (t) => {
  // 所有操作使用同一个事务
  const user = await User.create({ name: '张三' }, { transaction: t });
  await Post.create({ title: '文章', userId: user.id }, { transaction: t });
  // 如果任何操作失败，自动回滚
});

// 方式2：手动管理
const t = await sequelize.transaction();
try {
  const user = await User.create({ name: '张三' }, { transaction: t });
  await Post.create({ title: '文章', userId: user.id }, { transaction: t });
  await t.commit();  // 提交
} catch (error) {
  await t.rollback();  // 回滚
  throw error;
}
```

### 🎯 前端类比

```javascript
// 类似于前端的 try-catch + 状态回滚
const previousState = store.state;
try {
  await api.updateUser(data);
  await api.updateProfile(data);
} catch (error) {
  store.state = previousState;  // 回滚状态
}
```

---

## 9. 性能优化

### 9.1 索引

索引就像书的目录，加快查询速度。

```javascript
// 定义模型时添加索引
const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    unique: true  // 唯一索引
  }
}, {
  indexes: [
    { fields: ['name'] },                    // 普通索引
    { fields: ['email'], unique: true },     // 唯一索引
    { fields: ['name', 'email'] },           // 复合索引
    { fields: ['createdAt'] }                // 用于排序
  ]
});
```

**索引原则**：
- WHERE 条件中常用的字段加索引
- ORDER BY 的字段加索引
- JOIN 的外键字段加索引
- 不要给低区分度的字段加索引（如性别）

### 9.2 避免 N+1 问题

```javascript
// ❌ N+1 问题（查询 1 次用户 + N 次文章）
const users = await User.findAll();
for (const user of users) {
  const posts = await Post.findAll({ where: { userId: user.id } });
}

// ✅ 预加载（只查询 2 次）
const users = await User.findAll({
  include: [{ model: Post, as: 'posts' }]
});
```

### 9.3 只查询需要的字段

```javascript
// ❌ 查询所有字段
const users = await User.findAll();

// ✅ 只查询需要的字段
const users = await User.findAll({
  attributes: ['id', 'name', 'email']
});
```

### 9.4 分页查询

```javascript
// ❌ 一次性加载所有数据
const users = await User.findAll();

// ✅ 分页加载
const { count, rows } = await User.findAndCountAll({
  limit: 20,
  offset: 0
});
```

---

## 10. 最佳实践

### 10.1 模型定义规范

```javascript
// ✅ 好的实践
const User = sequelize.define('User', {
  // 1. 主键用 id
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // 2. 字段有注释
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '用户名'
  },
  
  // 3. 敏感字段有默认值
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // 4. 验证规则
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  }
}, {
  // 5. 统一配置
  tableName: 'users',
  timestamps: true,
  underscored: true,
  paranoid: true  // 软删除
});
```

### 10.2 查询安全

```javascript
// ❌ 拼接 SQL（有注入风险）
const sql = `SELECT * FROM users WHERE name = '${name}'`;

// ✅ 使用参数化查询
const users = await User.findAll({
  where: { name: name }
});

// ✅ 原生查询使用占位符
const users = await sequelize.query(
  'SELECT * FROM users WHERE name = ?',
  { replacements: [name] }
);
```

### 10.3 错误处理

```javascript
const createUser = async (data) => {
  try {
    const user = await User.create(data);
    return user;
  } catch (error) {
    // 处理特定错误
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new Error('邮箱已存在');
    }
    if (error.name === 'SequelizeValidationError') {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
};
```

### 10.4 环境配置

```javascript
// config/database.js
const config = {
  development: {
    dialect: 'mysql',
    host: 'localhost',
    database: 'myapp_dev',
    logging: console.log
  },
  production: {
    dialect: 'mysql',
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    logging: false,  // 生产环境关闭日志
    pool: {
      max: 20,
      min: 5
    }
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
```

---

## 📝 练习题

### 练习1：基础 CRUD

创建一个 `products` 表，实现：
1. 添加商品
2. 查询所有商品
3. 根据价格范围筛选
4. 更新商品库存
5. 删除商品

### 练习2：关联查询

实现用户和订单的关联：
1. 一个用户可以有多个订单
2. 查询用户时包含其订单列表
3. 查询订单时包含用户信息

### 练习3：分页搜索

实现商品搜索接口：
1. 支持关键词模糊搜索
2. 支持价格范围筛选
3. 支持分页
4. 返回总数和当前页数据

---

## 🔗 相关资源

- [Sequelize 官方文档](https://sequelize.org/)
- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [SQL 教程 - W3Schools](https://www.w3schools.com/sql/)

---

## 📦 完整代码

- [GitHub - Course_5](https://github.com/Juhao978/node-learning/tree/main/Course_5)
- [Gitee - Course_5](https://gitee.com/Juhao978/node-learning/tree/main/Course_5)

