# 第2课：中间件（Middleware）深入理解

## 📚 本课学习目标

- 理解什么是中间件，以及它的核心作用
- 掌握中间件的执行顺序和 `next()` 函数
- 学会编写自定义中间件
- 理解 CORS 跨域原理
- 掌握错误处理中间件的用法

---

## 🚀 快速开始

### 步骤1：安装依赖

```bash
cd Course_2/my-node-api
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

### 1. 什么是中间件？

**中间件（Middleware）** 是 Express 最核心的概念。

**本质**：中间件就是一个函数，它可以：
- 访问请求对象 (`req`)
- 访问响应对象 (`res`)  
- 调用下一个中间件 (`next`)

**函数签名**：

```javascript
function middleware(req, res, next) {
  // 你的逻辑
  next(); // 调用下一个中间件
}
```

### 🎯 前端类比：中间件 = Vue 路由守卫 + Axios 拦截器

作为前端开发者，你一定用过这些：

**Vue Router 的全局前置守卫**：
```javascript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');  // 拦截，跳转到登录
  } else {
    next();  // 放行
  }
});
```

**Axios 请求拦截器**：
```javascript
axios.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`;
  return config;  // 继续请求
});
```

**Express 中间件**：
```javascript
const authMiddleware = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: '未登录' });  // 拦截
  }
  next();  // 放行
};
```

**对比表**：

| 概念 | Vue Router | Axios | Express |
|------|------------|-------|---------|
| 拦截时机 | 路由跳转前 | 请求发送前/响应返回后 | 请求处理的任意阶段 |
| 放行函数 | `next()` | `return config` | `next()` |
| 拦截方式 | `next('/login')` | 抛出错误 | `res.status(401).json()` |
| 添加数据 | `to.meta` | `config.headers` | `req.xxx` |

---

### 2. 中间件执行顺序

Express 按照 **代码书写顺序** 执行中间件：

```javascript
app.use(middleware1);  // 第1个执行
app.use(middleware2);  // 第2个执行
app.use(middleware3);  // 第3个执行
app.get('/users', handler);  // 最后执行（如果路径匹配）
```

**执行流程图**：

```
客户端请求
    │
    ▼
┌─────────────────────┐
│  1. requestLogger   │  记录请求日志
│     next() ─────────┼──┐
└─────────────────────┘  │
                         ▼
              ┌─────────────────────┐
              │  2. requestEnhancer │  给 req 添加属性
              │     next() ─────────┼──┐
              └─────────────────────┘  │
                                       ▼
                            ┌─────────────────────┐
                            │  3. corsMiddleware  │  处理跨域
                            │     next() ─────────┼──┐
                            └─────────────────────┘  │
                                                     ▼
                                          ┌─────────────────────┐
                                          │  4. express.json()  │  解析 JSON
                                          │     next() ─────────┼──┐
                                          └─────────────────────┘  │
                                                                   ▼
                                                        ┌─────────────────────┐
                                                        │  5. simpleAuth      │  认证检查
                                                        │     next() ─────────┼──┐
                                                        └─────────────────────┘  │
                                                                                 ▼
                                                                      ┌─────────────────────┐
                                                                      │  6. 路由处理器       │
                                                                      │     res.json()      │
                                                                      └─────────────────────┘
                                                                                 │
                                                                                 ▼
                                                                            响应返回
```

### 🎯 前端类比

这就像 Axios 的多个拦截器：

```javascript
// 第一个拦截器
axios.interceptors.request.use(config => {
  console.log('拦截器1');
  return config;  // 相当于 next()
});

// 第二个拦截器
axios.interceptors.request.use(config => {
  console.log('拦截器2');
  config.headers.token = 'xxx';
  return config;  // 相当于 next()
});

// 执行顺序：拦截器1 → 拦截器2 → 发送请求
```

---

### 3. `next()` 函数详解

`next()` 是控制流程的关键：

#### 情况1：正常传递

```javascript
const logger = (req, res, next) => {
  console.log('请求到达');
  next();  // ✅ 继续执行下一个中间件
};
```

#### 情况2：提前终止（不调用 next）

```javascript
const authCheck = (req, res, next) => {
  if (!req.headers.authorization) {
    // ❌ 不调用 next，直接返回响应
    return res.status(401).json({ error: '未授权' });
  }
  next();  // ✅ 验证通过才继续
};
```

#### 情况3：传递错误

```javascript
const riskyOperation = (req, res, next) => {
  try {
    // 可能出错的操作
    JSON.parse('invalid json');
  } catch (error) {
    next(error);  // 传递给错误处理中间件
  }
};
```

### 🎯 前端类比

Vue Router 的 `next()` 用法几乎一样：

```javascript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    if (!isLoggedIn) {
      // 情况2：拦截，不放行
      next('/login');
    } else {
      // 情况1：正常放行
      next();
    }
  } else {
    next();
  }
});
```

---

### 4. 中间件的三种注册方式

#### 方式1：全局中间件

对所有请求都生效：

```javascript
app.use(loggerMiddleware);
```

**前端类比**：Vue Router 的 `router.beforeEach()`

#### 方式2：路径中间件

只对特定路径生效：

```javascript
// 只有 /api 开头的请求会执行这个中间件
app.use('/api', apiMiddleware);

// 例如：
// GET /api/users     ✅ 会执行
// GET /api/products  ✅ 会执行
// GET /users         ❌ 不会执行
```

**前端类比**：Vue Router 的路由独享守卫

#### 方式3：路由级中间件

只对特定路由生效：

```javascript
// authMiddleware 只在这个路由执行
app.post('/users', authMiddleware, (req, res) => {
  // 创建用户
});

// 可以串联多个中间件
app.delete('/users/:id', auth, checkAdmin, (req, res) => {
  // 删除用户
});
```

**前端类比**：Vue 组件内的 `beforeRouteEnter`

---

### 5. CORS 跨域详解

#### 什么是跨域？

浏览器的 **同源策略** 规定：
- 网页只能向 **同源** 的服务器发送 AJAX 请求
- **源** = 协议 + 域名 + 端口

```
http://localhost:5173  (前端 Vite 开发服务器)
http://localhost:3000  (后端 Express)
     ↑
   端口不同 = 跨域！
```

### 🎯 前端开发者的痛点

你在前端开发时一定遇到过这个错误：

```
Access to fetch at 'http://localhost:3000/api/users' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

这就是跨域问题！现在你在学后端，就能从根本上解决它。

#### CORS 解决原理

后端设置特殊的响应头，告诉浏览器"我允许这个前端访问"：

```javascript
const corsMiddleware = (req, res, next) => {
  // 允许的来源（* 表示所有，生产环境应指定具体域名）
  res.header('Access-Control-Allow-Origin', '*');
  
  // 允许的 HTTP 方法
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  
  // 允许的请求头
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  next();
};
```

#### 预检请求（Preflight）

**这是很多前端开发者困惑的地方！**

你可能发现：明明只发了一个 POST 请求，为什么网络面板里有两个请求？

第一个是 **OPTIONS 请求**（预检请求），浏览器自动发的。

**什么时候会触发预检？**

- 使用 PUT、DELETE 等方法
- Content-Type 是 application/json（不是表单提交）
- 包含自定义请求头（如 Authorization）

```javascript
// 处理预检请求
if (req.method === 'OPTIONS') {
  return res.sendStatus(200);  // 告诉浏览器"可以发送实际请求"
}
```

---

### 6. express.json() 中间件

这是 Express 内置的中间件，用于解析 JSON 格式的请求体。

#### 为什么需要它？

HTTP 请求体是原始的字符串/Buffer，需要解析才能使用：

```javascript
// 没有 express.json() 时
app.post('/users', (req, res) => {
  console.log(req.body);  // undefined！
});

// 有 express.json() 时
app.use(express.json());
app.post('/users', (req, res) => {
  console.log(req.body);  // { name: '张三', email: '...' }
});
```

### 🎯 前端类比

你用 axios 发请求：
```javascript
axios.post('/users', { name: '张三' });
// axios 自动把对象序列化成 JSON 字符串发送
```

后端收到的其实是字符串 `'{"name":"张三"}'`，需要 `express.json()` 中间件把它解析回对象。

这就像你收到 API 响应后调用 `response.json()` 一样。

---

### 7. 错误处理中间件

错误处理中间件有 **4个参数**，Express 通过参数数量识别它：

```javascript
// 普通中间件：3个参数
app.use((req, res, next) => { ... });

// 错误处理中间件：4个参数（注意第一个是 err）
app.use((err, req, res, next) => { ... });
```

#### 使用方式

```javascript
// 1. 错误处理中间件必须放在最后
app.use(errorHandler);

// 2. 在其他中间件/路由中抛出错误
app.get('/error-test', (req, res, next) => {
  const err = new Error('测试错误');
  err.status = 400;
  next(err);  // 传递给错误处理中间件
});

// 3. 错误处理中间件接收并处理
const errorHandler = (err, req, res, next) => {
  console.error('错误:', err.message);
  res.status(err.status || 500).json({
    error: err.message
  });
};
```

### 🎯 前端类比

这就像 Axios 的响应拦截器处理错误：

```javascript
axios.interceptors.response.use(
  response => response,
  error => {
    // 统一处理错误
    if (error.response.status === 401) {
      router.push('/login');
    }
    return Promise.reject(error);
  }
);
```

Express 的错误处理中间件就是后端版的"统一错误处理"。

---

### 8. Node.js 事件机制

代码中用到的 `res.on('finish', callback)` 是 Node.js 的事件机制：

```javascript
res.on('finish', () => {
  console.log('响应已发送');
});
```

#### EventEmitter 基础

Node.js 很多对象都继承自 `EventEmitter`：

```javascript
const EventEmitter = require('events');
const emitter = new EventEmitter();

// 监听事件
emitter.on('greet', (name) => {
  console.log(`Hello, ${name}!`);
});

// 触发事件
emitter.emit('greet', '张三');  // 输出: Hello, 张三!
```

### 🎯 前端类比

这就像 DOM 事件或 Vue 的自定义事件：

```javascript
// DOM 事件
button.addEventListener('click', () => { ... });

// Vue 自定义事件
this.$emit('update', data);  // 触发
this.$on('update', handler);  // 监听

// Node.js EventEmitter
emitter.emit('update', data);  // 触发
emitter.on('update', handler); // 监听
```

#### 常用内置事件

| 对象 | 事件 | 触发时机 |
|------|------|---------|
| `res` | `finish` | 响应发送完成 |
| `req` | `data` | 接收到数据块 |
| `req` | `end` | 数据接收完成 |
| `req` | `error` | 发生错误 |
| `process` | `exit` | 进程退出 |
| `process` | `uncaughtException` | 未捕获的异常 |

---

## 🧪 动手练习

### 练习1：编写请求计时中间件

创建一个中间件，记录每个请求的处理时间：

```javascript
const timer = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  
  next();
};
```

### 练习2：编写请求限流中间件

限制每个 IP 每分钟最多请求 10 次：

```javascript
const requestCounts = new Map();

const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000;  // 1分钟
  const maxRequests = 10;
  
  // 获取该 IP 的请求记录
  const record = requestCounts.get(ip) || { count: 0, startTime: now };
  
  // 如果超过时间窗口，重置
  if (now - record.startTime > windowMs) {
    record.count = 1;
    record.startTime = now;
  } else {
    record.count++;
  }
  
  requestCounts.set(ip, record);
  
  if (record.count > maxRequests) {
    return res.status(429).json({ error: '请求过于频繁，请稍后再试' });
  }
  
  next();
};
```

---

## 📝 本课小结

1. **中间件是函数**：接收 `(req, res, next)` 三个参数
2. **前端类比**：中间件 ≈ Vue 路由守卫 + Axios 拦截器
3. **执行顺序**：按代码书写顺序，从上到下
4. **next() 是关键**：控制是否继续执行下一个中间件
5. **三种注册方式**：全局、路径、路由级
6. **错误处理中间件**：4个参数，放在最后
7. **CORS**：通过响应头解决跨域问题

---

## ➡️ 下一课预告

**第3课：路由模块化 & MVC 架构**

- 将路由拆分到独立文件
- 理解 MVC（Model-View-Controller）架构
- 使用 express.Router() 组织代码
- 项目目录结构最佳实践

---

## 📦 完整代码

- [GitHub - Course_2](https://github.com/Juhao978/node-learning/tree/main/Course_2)
- [Gitee - Course_2](https://gitee.com/Juhao978/node-learning/tree/main/Course_2)