# 第5课：数据库连接（Sequelize ORM）

## 📚 本课学习目标

- 理解 ORM 是什么
- 使用 Sequelize 连接数据库
- 定义数据模型
- 实现数据的 CRUD 操作

---

## 🚀 快速开始

```bash
cd Course_5/my-node-api
pnpm install
pnpm start
# 访问 http://localhost:3000/test.html
```

**注意**：本课使用 SQLite 数据库，无需安装 MySQL！

---

## 📖 知识点详解

### 1. 什么是 ORM？

**ORM**（Object-Relational Mapping，对象关系映射）是一种技术：

- 用**面向对象**的方式操作数据库
- 不需要写 SQL 语句
- 一个 JavaScript **类** 对应一张**数据库表**
- 一个**对象实例** 对应一条**记录**

```javascript
// 传统方式：写 SQL
const sql = 'SELECT * FROM users WHERE id = 1';

// ORM 方式：用对象操作
const user = await User.findByPk(1);
```

### 🎯 前端类比

ORM 就像 **Axios**：

| 底层 | 封装层 |
|-----|-------|
| 原生 fetch | Axios |
| 原生 SQL | Sequelize |

Axios 封装了 HTTP 请求，Sequelize 封装了数据库操作。

---

### 2. Sequelize 简介

**Sequelize** 是 Node.js 最流行的 ORM 库。

#### 安装

```bash
pnpm add sequelize
pnpm add mysql2   # MySQL 驱动
# 或
pnpm add sqlite3  # SQLite 驱动（本课使用）
```

#### 连接数据库

```javascript
const { Sequelize } = require('sequelize');

// SQLite（本地文件）
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

// MySQL
const sequelize = new Sequelize('数据库名', '用户名', '密码', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql'
});

// 测试连接
await sequelize.authenticate();
```

---

### 3. 定义模型（Model）

模型定义了数据库表的结构：

```javascript
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  // 字段定义
  name: {
    type: DataTypes.STRING(50),  // VARCHAR(50)
    allowNull: false              // NOT NULL
  },
  
  email: {
    type: DataTypes.STRING(100),
    unique: true                  // UNIQUE 约束
  },
  
  age: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 150
    }
  },
  
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user'
  }
}, {
  tableName: 'users',  // 指定表名
  timestamps: true     // 自动添加 createdAt, updatedAt
});
```

### 🎯 前端类比

这就像 TypeScript 的 interface：

```typescript
// TypeScript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  role: 'admin' | 'user';
}

// Sequelize 模型起到类似的作用，但还能：
// 1. 自动创建数据库表
// 2. 验证数据
// 3. 定义默认值
```

---

### 4. 常用数据类型

| Sequelize 类型 | SQL 类型 | 说明 |
|---------------|----------|------|
| `DataTypes.STRING` | VARCHAR(255) | 字符串 |
| `DataTypes.STRING(100)` | VARCHAR(100) | 指定长度 |
| `DataTypes.TEXT` | TEXT | 长文本 |
| `DataTypes.INTEGER` | INT | 整数 |
| `DataTypes.BIGINT` | BIGINT | 大整数 |
| `DataTypes.FLOAT` | FLOAT | 浮点数 |
| `DataTypes.DECIMAL(10,2)` | DECIMAL(10,2) | 精确小数 |
| `DataTypes.BOOLEAN` | TINYINT(1) | 布尔值 |
| `DataTypes.DATE` | DATETIME | 日期时间 |
| `DataTypes.DATEONLY` | DATE | 仅日期 |
| `DataTypes.JSON` | JSON | JSON 对象 |
| `DataTypes.ENUM('a','b')` | ENUM | 枚举值 |

---

### 5. CRUD 操作

#### Create - 创建

```javascript
// 方式1：build + save
const user = User.build({ name: '张三', email: 'test@example.com' });
await user.save();

// 方式2：create（推荐）
const user = await User.create({
  name: '张三',
  email: 'test@example.com'
});
```

#### Read - 查询

```javascript
// 查询所有
const users = await User.findAll();

// 根据主键查询
const user = await User.findByPk(1);

// 条件查询
const user = await User.findOne({
  where: { email: 'test@example.com' }
});

// 分页查询
const { count, rows } = await User.findAndCountAll({
  where: { role: 'user' },
  limit: 10,
  offset: 0,
  order: [['createdAt', 'DESC']]
});
```

#### Update - 更新

```javascript
// 方式1：查询后更新
const user = await User.findByPk(1);
user.name = '新名字';
await user.save();

// 方式2：update 方法
await user.update({ name: '新名字' });

// 方式3：批量更新
await User.update(
  { role: 'user' },
  { where: { role: 'guest' } }
);
```

#### Delete - 删除

```javascript
// 方式1：查询后删除
const user = await User.findByPk(1);
await user.destroy();

// 方式2：批量删除
await User.destroy({
  where: { role: 'guest' }
});
```

### 🎯 前端类比

这些操作对应前端调用 API：

| Sequelize | 前端 API 调用 |
|-----------|--------------|
| `User.findAll()` | `axios.get('/users')` |
| `User.findByPk(1)` | `axios.get('/users/1')` |
| `User.create(data)` | `axios.post('/users', data)` |
| `user.update(data)` | `axios.put('/users/1', data)` |
| `user.destroy()` | `axios.delete('/users/1')` |

---

### 6. 查询操作符

Sequelize 提供了丰富的查询操作符：

```javascript
const { Op } = require('sequelize');

// 比较操作
User.findAll({
  where: {
    age: { [Op.gt]: 18 },       // > 18
    age: { [Op.gte]: 18 },      // >= 18
    age: { [Op.lt]: 60 },       // < 60
    age: { [Op.lte]: 60 },      // <= 60
    age: { [Op.ne]: 25 },       // != 25
    age: { [Op.between]: [18, 60] }  // BETWEEN 18 AND 60
  }
});

// 模糊查询
User.findAll({
  where: {
    name: { [Op.like]: '%张%' }  // LIKE '%张%'
  }
});

// 逻辑操作
User.findAll({
  where: {
    [Op.or]: [
      { name: '张三' },
      { name: '李四' }
    ]
  }
});

// IN 查询
User.findAll({
  where: {
    role: { [Op.in]: ['admin', 'user'] }
  }
});
```

---

### 7. 数据库同步

Sequelize 可以自动创建/更新数据库表：

```javascript
// 同步所有模型
await sequelize.sync();

// 强制同步（删除并重建表，会丢失数据！）
await sequelize.sync({ force: true });

// 修改表结构（谨慎使用）
await sequelize.sync({ alter: true });
```

**生产环境建议**：使用 Sequelize 迁移（Migrations）管理数据库变更。

---

### 8. 模型验证

Sequelize 内置验证器：

```javascript
const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: { msg: '邮箱格式不正确' }
    }
  },
  
  age: {
    type: DataTypes.INTEGER,
    validate: {
      min: { args: [1], msg: '年龄必须大于0' },
      max: { args: [150], msg: '年龄不能超过150' }
    }
  },
  
  website: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true  // 验证 URL 格式
    }
  }
});
```

常用验证器：
- `isEmail` - 邮箱格式
- `isUrl` - URL 格式
- `isIP` - IP 地址
- `isNumeric` - 只包含数字
- `isAlpha` - 只包含字母
- `len: [min, max]` - 长度范围
- `min` / `max` - 数值范围
- `notEmpty` - 非空
- `isIn: [['a', 'b']]` - 在列表中

---

## 🧪 动手练习

### 练习1：添加产品模型

创建 Product 模型并实现 CRUD：

```javascript
const Product = sequelize.define('Product', {
  name: DataTypes.STRING,
  price: DataTypes.DECIMAL(10, 2),
  stock: DataTypes.INTEGER,
  category: DataTypes.STRING
});
```

### 练习2：实现软删除

添加 `deletedAt` 字段，删除时不真正删除，只标记：

```javascript
const User = sequelize.define('User', {
  // ... 其他字段
}, {
  paranoid: true  // 启用软删除
});

// 删除（实际是设置 deletedAt）
await user.destroy();

// 查询时自动排除已删除
await User.findAll();  // 不包含已删除的

// 包含已删除的
await User.findAll({ paranoid: false });

// 真正删除
await user.destroy({ force: true });
```

---

## 📝 本课小结

1. **ORM** 让你用 JavaScript 对象操作数据库
2. **Sequelize** 是 Node.js 最流行的 ORM
3. **模型** 定义数据结构，自动创建数据库表
4. **CRUD** 操作：create、findAll、update、destroy
5. **Op** 操作符提供丰富的查询条件

---

## ➡️ 下一课预告

**第6课：用户认证（JWT）**

- 密码加密存储
- JWT 令牌生成和验证
- 登录注册接口
- 保护需要认证的接口

---

## 📦 完整代码

- [GitHub - Course_5](https://github.com/Juhao978/node-learning/tree/main/Course_5)
- [Gitee - Course_5](https://gitee.com/Juhao978/node-learning/tree/main/Course_5)
