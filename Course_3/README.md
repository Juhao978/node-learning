# 第3课：路由模块化 & MVC 架构

## 📚 本课学习目标

- 理解 MVC 架构模式
- 使用 express.Router() 模块化路由
- 掌握项目目录结构最佳实践
- 学会分层组织代码

---

## 🚀 快速开始

```bash
cd Course_3/my-node-api
pnpm install
pnpm start
# 访问 http://localhost:3000/test.html
```

---

## 📖 知识点详解

### 1. 什么是 MVC？

**MVC** 是一种软件架构模式，将代码分为三层：

| 层 | 名称 | 职责 |
|---|------|------|
| M | Model（模型） | 数据和业务逻辑 |
| V | View（视图） | 用户界面展示 |
| C | Controller（控制器） | 接收请求，调度 Model 和 View |

**在 API 开发中**（没有传统的 View），我们通常这样理解：

```
请求 → Route → Controller → Model → 数据库
                   ↓
响应 ← JSON ← Controller
```

### 🎯 前端类比

MVC 对于前端开发者来说很熟悉：

| 后端 MVC | Vue/React 前端 |
|---------|---------------|
| Route | Vue Router |
| Controller | 页面组件 (Views) |
| Model | 状态管理 (Pinia/Vuex) |
| 数据库 | API 接口 |

---

### 2. 项目目录结构

```
my-node-api/
├── index.js              # 入口文件，配置和启动
├── routes/               # 路由层
│   ├── userRoutes.js     # 用户相关路由
│   └── productRoutes.js  # 产品相关路由
├── controllers/          # 控制器层
│   ├── userController.js
│   └── productController.js
├── models/               # 模型层
│   ├── User.js
│   └── Product.js
└── public/               # 静态文件
```

**为什么要分层？**

1. **职责分离**：每层只做一件事
2. **易于维护**：修改一层不影响其他层
3. **团队协作**：不同人负责不同层
4. **代码复用**：Model 可以被多个 Controller 使用

### 🎯 前端类比

这和 Vue 项目结构非常相似：

```
vue-project/
├── main.js               # 入口文件
├── router/               # 路由配置
│   └── index.js
├── views/                # 页面组件（类似 Controller）
│   ├── UserList.vue
│   └── ProductList.vue
├── stores/               # 状态管理（类似 Model）
│   ├── user.js
│   └── product.js
└── public/               # 静态资源
```

---

### 3. express.Router() 详解

`express.Router()` 创建一个模块化的路由处理器。

**之前（所有路由写在一起）**：

```javascript
// index.js - 变得越来越长...
app.get('/users', ...);
app.post('/users', ...);
app.get('/products', ...);
app.post('/products', ...);
// 几百行...
```

**现在（模块化）**：

```javascript
// routes/userRoutes.js
const router = express.Router();
router.get('/', getUsers);
router.post('/', createUser);
module.exports = router;

// index.js - 干净清爽
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
```

#### express.Router() 的特点

```javascript
const router = express.Router();

// 可以使用所有 HTTP 方法
router.get('/', handler);
router.post('/', handler);
router.put('/:id', handler);
router.delete('/:id', handler);

// 可以使用中间件
router.use(authMiddleware);  // 对该路由下所有接口生效

// 可以嵌套
router.use('/profile', profileRouter);
```

### 🎯 前端类比

这就像 Vue Router 的模块化：

```javascript
// Vue Router 方式
const userRoutes = {
  path: '/users',
  children: [
    { path: '', component: UserList },
    { path: ':id', component: UserDetail }
  ]
};

// Express Router 方式
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
```

---

### 4. Model 层详解

Model 层负责**数据操作**，是业务逻辑的核心：

```javascript
// models/User.js

// 数据存储（目前是内存，后面会换成数据库）
let users = [...];

// 查询所有
const findAll = () => users;

// 根据 ID 查询
const findById = (id) => users.find(u => u.id === id);

// 创建
const create = (data) => {
  const newUser = { id: nextId++, ...data };
  users.push(newUser);
  return newUser;
};

// 更新
const update = (id, data) => {
  const user = findById(id);
  if (!user) return null;
  Object.assign(user, data);
  return user;
};

// 删除
const remove = (id) => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
};
```

### 🎯 前端类比

Model 就像 Pinia Store：

```javascript
// Pinia Store
export const useUserStore = defineStore('user', {
  state: () => ({ users: [] }),
  
  actions: {
    async fetchUsers() { ... },
    async createUser(data) { ... },
    async updateUser(id, data) { ... },
    async deleteUser(id) { ... }
  }
});
```

---

### 5. Controller 层详解

Controller 负责**处理请求和响应**：

```javascript
// controllers/userController.js

const User = require('../models/User');

const getUsers = (req, res) => {
  // 1. 调用 Model 获取数据
  const users = User.findAll();
  
  // 2. 返回响应
  res.json({ total: users.length, data: users });
};

const createUser = (req, res) => {
  // 1. 从请求中获取数据
  const { name, email } = req.body;
  
  // 2. 验证
  if (!name || !email) {
    return res.status(400).json({ error: '参数错误' });
  }
  
  // 3. 调用 Model 创建
  const newUser = User.create({ name, email });
  
  // 4. 返回响应
  res.status(201).json(newUser);
};
```

**Controller 的职责**：

1. ✅ 接收请求参数
2. ✅ 调用 Model 处理业务
3. ✅ 返回响应
4. ❌ 不直接操作数据
5. ❌ 不包含复杂业务逻辑

### 🎯 前端类比

Controller 就像 Vue 组件中调用 Store 的方法：

```vue
<script setup>
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// 类似 Controller 的 getUsers
const loadUsers = async () => {
  await userStore.fetchUsers();  // 调用 "Model"
  // 数据会自动更新到 "View"
};

// 类似 Controller 的 createUser
const handleCreate = async (form) => {
  if (!form.name) return;  // 验证
  await userStore.createUser(form);  // 调用 "Model"
};
</script>
```

---

### 6. Route 层详解

Route 层负责**URL 映射**：

```javascript
// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// URL + HTTP方法 → Controller方法
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
```

**Route 的职责**：

1. ✅ 定义 URL 路径
2. ✅ 指定 HTTP 方法
3. ✅ 映射到 Controller
4. ✅ 可以添加路由级中间件
5. ❌ 不包含业务逻辑

---

### 7. 请求处理完整流程

```
GET /api/users/1
        │
        ▼
┌─────────────────────────────────────────┐
│  index.js                               │
│  app.use('/api/users', userRoutes)      │
│  匹配到 /api/users 前缀                  │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  routes/userRoutes.js                   │
│  router.get('/:id', getUserById)        │
│  匹配到 /:id，调用 controller           │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  controllers/userController.js          │
│  getUserById(req, res)                  │
│  调用 Model，返回响应                    │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  models/User.js                         │
│  findById(1)                            │
│  从数据源查找并返回                      │
└─────────────────────────────────────────┘
        │
        ▼
    { id: 1, name: '张三', ... }
```

---

## 🧪 动手练习

### 练习1：添加订单模块

按照 MVC 结构，创建订单相关的：

1. `models/Order.js` - 订单模型
2. `controllers/orderController.js` - 订单控制器
3. `routes/orderRoutes.js` - 订单路由

### 练习2：添加路由级中间件

给产品的创建、更新、删除接口添加认证中间件：

```javascript
// routes/productRoutes.js
const authMiddleware = (req, res, next) => {
  if (req.headers['x-api-key'] !== 'secret') {
    return res.status(401).json({ error: '未授权' });
  }
  next();
};

// 只对修改操作要求认证
router.post('/', authMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);
```

---

## 📝 本课小结

1. **MVC** 是一种分层架构：Model（数据）、View（视图）、Controller（调度）
2. **express.Router()** 可以创建模块化路由
3. **分层的好处**：职责分离、易于维护、团队协作
4. **标准目录结构**：routes/、controllers/、models/
5. **前端类比**：router/ → routes/，views/ → controllers/，stores/ → models/

---

## ➡️ 下一课预告

**第4课：数据验证 & 错误处理**

- 使用 Joi/express-validator 验证请求数据
- 统一的错误处理机制
- 自定义错误类
- 异步错误处理

---

## 📦 完整代码

👉 [GitHub - Course_3](https://github.com/Juhao978/node-learning/tree/main/Course_3)
