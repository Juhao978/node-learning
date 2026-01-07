# 第1课：Express 基础 & RESTful API

## 📚 本课学习目标

- 理解 Node.js 和 Express 是什么
- 理解 RESTful API 设计规范
- 掌握 HTTP 方法与 CRUD 操作的对应关系
- 能够创建基本的增删改查接口

---

## 🚀 快速开始

### 步骤1：安装依赖

```bash
cd Course_1/my-node-api
pnpm install
```

### 步骤2：启动服务器

```bash
pnpm start
```

### 步骤3：打开测试页面

浏览器访问：http://localhost:3000/test.html

---

## 📖 知识点详解

### 1. Node.js 是什么？

**前端视角理解**：

你写的 JavaScript 代码平时在哪里运行？——**浏览器**

而 Node.js 让 JavaScript 可以在**服务器**上运行！

```
┌─────────────────────────────────────────────────────┐
│                    JavaScript                        │
├─────────────────────────┬───────────────────────────┤
│       浏览器环境         │       Node.js 环境        │
├─────────────────────────┼───────────────────────────┤
│  ✅ DOM 操作            │  ❌ 没有 DOM              │
│  ✅ BOM (window)        │  ❌ 没有 window           │
│  ✅ fetch/XMLHttpRequest│  ✅ 可以发请求            │
│  ❌ 不能读写文件         │  ✅ 可以读写文件 (fs)     │
│  ❌ 不能操作数据库       │  ✅ 可以连接数据库        │
│  ❌ 不能创建服务器       │  ✅ 可以创建 HTTP 服务器  │
└─────────────────────────┴───────────────────────────┘
```

**类比**：
- 浏览器中的 JS = 在客户端执行的员工
- Node.js 中的 JS = 在服务器执行的员工
- 都说同一种语言（JavaScript），但工作环境不同，能做的事也不同

---

### 2. Express 是什么？

**一句话**：Express 是一个 Node.js 的 Web 框架，帮你快速搭建 HTTP 服务器。

**前端类比**：

| 前端 | 后端 |
|------|------|
| Vue/React 帮你构建 UI | Express 帮你构建 API |
| Vue Router 处理页面路由 | Express Router 处理 API 路由 |
| Vuex/Pinia 管理状态 | 数据库管理数据 |

**没有 Express 你需要这样写**：

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ id: 1, name: '张三' }]));
  } else if (req.method === 'POST' && req.url === '/users') {
    // 还要手动解析请求体...
  }
  // 每个接口都要写一堆 if-else
});

server.listen(3000);
```

**有了 Express 只需要**：

```javascript
const express = require('express');
const app = express();

app.get('/users', (req, res) => {
  res.json([{ id: 1, name: '张三' }]);
});

app.post('/users', (req, res) => {
  res.json({ id: 2, name: req.body.name });
});

app.listen(3000);
```

---

### 3. 什么是 RESTful API？

**REST**（Representational State Transfer）是一种 API 设计风格。

**核心思想**：用 **HTTP 方法** 表示 **操作类型**，用 **URL** 表示 **资源**。

#### HTTP 方法与 CRUD 对应

| HTTP 方法 | CRUD 操作 | 描述 | 示例 |
|-----------|-----------|------|------|
| GET | Read | 获取资源 | 获取用户列表 |
| POST | Create | 创建资源 | 创建新用户 |
| PUT | Update | 更新资源（全量） | 修改用户信息 |
| PATCH | Update | 更新资源（部分） | 只修改用户名 |
| DELETE | Delete | 删除资源 | 删除用户 |

#### URL 设计规范

```
✅ 好的设计（名词 + HTTP 方法）
GET    /users          获取用户列表
GET    /users/1        获取 ID 为 1 的用户
POST   /users          创建用户
PUT    /users/1        更新 ID 为 1 的用户
DELETE /users/1        删除 ID 为 1 的用户

❌ 不好的设计（动词在 URL 中）
GET    /getUsers
GET    /getUserById?id=1
POST   /createUser
POST   /updateUser
POST   /deleteUser
```

**前端类比**：

这和 Vue Router 的设计类似：
- Vue Router: `/users/:id` → 动态路由参数
- Express: `/users/:id` → 同样是动态参数

---

### 4. Express 核心代码解析

#### 4.1 创建应用实例

```javascript
const express = require('express');  // 引入 Express
const app = express();               // 创建应用实例
```

**类比 Vue**：
```javascript
import { createApp } from 'vue';
const app = createApp(App);  // 创建 Vue 应用实例
```

#### 4.2 定义路由

```javascript
app.get('/users', (req, res) => {
  // 处理 GET /users 请求
});

app.post('/users', (req, res) => {
  // 处理 POST /users 请求
});
```

**类比 Vue Router**：
```javascript
const routes = [
  { path: '/users', component: UserList },
  { path: '/users/:id', component: UserDetail }
];
```

#### 4.3 请求对象 req

`req` 包含客户端发送的所有信息：

```javascript
app.get('/users/:id', (req, res) => {
  req.params.id    // 路由参数，如 /users/123 中的 123
  req.query        // 查询参数，如 ?page=1&size=10
  req.body         // 请求体（POST/PUT 的数据）
  req.headers      // 请求头
  req.method       // 请求方法：GET, POST 等
  req.url          // 请求路径
});
```

**前端类比**：

| Express (req) | Vue Router |
|---------------|------------|
| `req.params.id` | `route.params.id` |
| `req.query.page` | `route.query.page` |

#### 4.4 响应对象 res

`res` 用于向客户端发送响应：

```javascript
res.send('Hello')           // 发送文本
res.json({ name: '张三' })  // 发送 JSON（最常用）
res.status(404)             // 设置状态码
res.status(404).json({...}) // 链式调用
res.sendStatus(204)         // 只发状态码，无内容
```

---

### 5. HTTP 状态码

作为前端你一定见过这些状态码，现在从后端视角理解它们：

```javascript
// 2xx - 成功
res.status(200).json(data);  // OK，请求成功
res.status(201).json(data);  // Created，创建成功（用于 POST）
res.sendStatus(204);         // No Content，删除成功

// 4xx - 客户端错误
res.status(400).json({ error: '参数错误' });    // Bad Request
res.status(401).json({ error: '未登录' });      // Unauthorized  
res.status(403).json({ error: '无权限' });      // Forbidden
res.status(404).json({ error: '资源不存在' });  // Not Found

// 5xx - 服务器错误
res.status(500).json({ error: '服务器错误' });  // Internal Server Error
```

**什么时候用什么状态码？**

| 场景 | 状态码 | 说明 |
|------|--------|------|
| GET 成功 | 200 | 返回数据 |
| POST 成功 | 201 | 资源创建成功 |
| DELETE 成功 | 204 | 删除成功，无返回内容 |
| 参数错误 | 400 | 前端传的数据有问题 |
| 未登录 | 401 | 需要登录 |
| 无权限 | 403 | 登录了但没权限 |
| 找不到 | 404 | 资源不存在 |
| 服务器崩了 | 500 | 后端代码有 bug |

---

### 6. 静态文件服务

```javascript
app.use(express.static(path.join(__dirname, 'public')));
```

这行代码让 Express 托管 `public` 文件夹中的静态文件。

**效果**：
- `public/test.html` → 访问 `http://localhost:3000/test.html`
- `public/css/style.css` → 访问 `http://localhost:3000/css/style.css`

**前端类比**：

这类似于 Vite/Webpack 的 `publicPath` 配置，让静态资源可以被访问。

---

### 7. JSON 解析中间件

```javascript
app.use(express.json());
```

这让 Express 能够解析 JSON 格式的请求体。

**没有这行代码**：
```javascript
app.post('/users', (req, res) => {
  console.log(req.body);  // undefined！！！
});
```

**有了这行代码**：
```javascript
app.post('/users', (req, res) => {
  console.log(req.body);  // { name: '张三', email: '...' }
});
```

**前端类比**：

你用 axios 发请求时：
```javascript
axios.post('/users', { name: '张三' });  // axios 自动把对象转成 JSON
```

后端收到的是 JSON 字符串，需要 `express.json()` 解析成对象。

---

## 🧪 动手练习

### 练习1：添加搜索功能

实现按名字搜索用户：`GET /users?name=张`

```javascript
app.get('/users', (req, res) => {
  let users = MockUser;
  
  // 如果有 name 查询参数，进行过滤
  if (req.query.name) {
    users = users.filter(u => u.name.includes(req.query.name));
  }
  
  res.json(users);
});
```

### 练习2：添加分页功能

实现分页：`GET /users?page=1&size=10`

```javascript
app.get('/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 10;
  
  const start = (page - 1) * size;
  const end = start + size;
  const paginatedUsers = MockUser.slice(start, end);
  
  res.json({
    data: paginatedUsers,
    pagination: {
      page,
      size,
      total: MockUser.length,
      totalPages: Math.ceil(MockUser.length / size)
    }
  });
});
```

---

## 📝 本课小结

1. **Node.js** 让 JavaScript 可以在服务器运行
2. **Express** 是一个 Web 框架，简化 HTTP 服务器开发
3. **RESTful API** 用 HTTP 方法表示操作，URL 表示资源
4. **req** 包含请求信息，**res** 用于发送响应
5. **状态码** 表示请求结果（2xx 成功，4xx 客户端错误，5xx 服务器错误）

---

## ➡️ 下一课预告

**第2课：中间件（Middleware）深入理解**

- 中间件是什么？为什么是 Express 的核心？
- 中间件执行顺序和 next() 函数
- 编写自定义中间件
- CORS 跨域原理详解

---

## 📦 完整代码

- [GitHub - Course_1](https://github.com/Juhao978/node-learning/tree/main/Course_1)
- [Gitee - Course_1](https://gitee.com/Juhao978/node-learning/tree/main/Course_1)
