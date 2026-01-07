# 第4课：数据验证 & 错误处理

## 📚 本课学习目标

- 使用 Joi 进行数据验证
- 创建自定义错误类
- 实现统一的错误处理机制
- 处理异步函数中的错误

---

## 🚀 快速开始

```bash
cd Course_4/my-node-api
pnpm install
pnpm start
# 访问 http://localhost:3000/test.html
```

---

## 📖 知识点详解

### 1. 为什么需要数据验证？

**永远不要相信用户输入！**

```javascript
// ❌ 没有验证，危险！
app.post('/users', (req, res) => {
  const user = User.create(req.body);  // 用户可以传任何东西
  res.json(user);
});

// ✅ 有验证，安全
app.post('/users', validate(schema), (req, res) => {
  const user = User.create(req.body);  // 数据已经被验证和清理
  res.json(user);
});
```

### 🎯 前端类比

这和前端表单验证一样重要：

```javascript
// ElementUI 表单验证
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
};
```

**但是！** 前端验证可以被绑过（用户可以直接调用 API），所以后端验证是**必须的**。

---

### 2. Joi 验证库详解

**Joi** 是 Node.js 最流行的验证库，语法直观、功能强大。

#### 安装

```bash
pnpm add joi
```

#### 基本用法

```javascript
const Joi = require('joi');

// 定义验证规则
const schema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(1).max(150)
});

// 执行验证
const { error, value } = schema.validate(data);

if (error) {
  // 验证失败
  console.log(error.details);
} else {
  // 验证通过，使用 value（已清理的数据）
  console.log(value);
}
```

#### 常用验证方法

```javascript
// 字符串
Joi.string()
  .min(2)                    // 最小长度
  .max(50)                   // 最大长度
  .email()                   // 邮箱格式
  .pattern(/^[a-z]+$/)       // 正则匹配
  .valid('a', 'b', 'c')      // 枚举值
  .required()                // 必填

// 数字
Joi.number()
  .integer()                 // 整数
  .min(1)                    // 最小值
  .max(100)                  // 最大值
  .positive()                // 正数

// 布尔
Joi.boolean()

// 数组
Joi.array()
  .items(Joi.string())       // 数组元素类型
  .min(1)                    // 最少元素数
  .max(10)                   // 最多元素数

// 对象
Joi.object({
  nested: Joi.string()
})

// 日期
Joi.date()
  .iso()                     // ISO 格式
  .greater('now')            // 大于当前时间
```

#### 自定义错误消息

```javascript
const schema = Joi.object({
  name: Joi.string()
    .min(2)
    .required()
    .messages({
      'string.empty': '姓名不能为空',
      'string.min': '姓名至少需要 {#limit} 个字符',
      'any.required': '姓名是必填项'
    })
});
```

### 🎯 前端类比

| Joi | ElementUI/VeeValidate |
|-----|----------------------|
| `Joi.string().required()` | `{ required: true }` |
| `Joi.string().min(2)` | `{ min: 2 }` |
| `Joi.string().email()` | `{ type: 'email' }` |
| `Joi.number().min(1).max(100)` | `{ type: 'number', min: 1, max: 100 }` |
| `.messages({...})` | `{ message: '...' }` |

---

### 3. 验证中间件

将 Joi 验证封装成可复用的中间件：

```javascript
// middleware/validate.js
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,    // 返回所有错误
      stripUnknown: true    // 移除未知字段
    });
    
    if (error) {
      const messages = error.details.map(d => d.message).join('; ');
      return next(new BadRequestError(messages));
    }
    
    req[property] = value;  // 使用验证后的值
    next();
  };
};
```

**使用方式**：

```javascript
// routes/userRoutes.js
router.post('/',
  validate(createUserSchema, 'body'),   // 验证请求体
  userController.createUser
);

router.get('/',
  validate(querySchema, 'query'),        // 验证查询参数
  userController.getUsers
);

router.get('/:id',
  validate(idSchema, 'params'),          // 验证路径参数
  userController.getUserById
);
```

---

### 4. 自定义错误类

为什么需要自定义错误类？

```javascript
// ❌ 普通 Error，信息不够
throw new Error('用户不存在');

// ✅ 自定义 Error，包含状态码
throw new NotFoundError('用户不存在');
// 自动设置 statusCode = 404
```

#### 实现

```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true;  // 标记为可预期错误
  }
}

// 快捷类
class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 404);
  }
}

class BadRequestError extends AppError {
  constructor(message = '请求参数错误') {
    super(message, 400);
  }
}
```

### 🎯 前端类比

这类似于 Axios 拦截器中对错误的分类处理：

```javascript
// 前端 axios 拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response.status === 401) {
      // 未登录
      router.push('/login');
    } else if (error.response.status === 404) {
      // 资源不存在
      showNotFound();
    } else if (error.response.status >= 500) {
      // 服务器错误
      showServerError();
    }
    return Promise.reject(error);
  }
);
```

后端自定义错误类让这种分类更加清晰。

---

### 5. 全局错误处理中间件

统一处理所有错误，返回一致的格式：

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // 开发环境：返回详细信息
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack
    });
  }
  
  // 生产环境：隐藏内部错误
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  
  // 未知错误
  console.error('ERROR:', err);
  return res.status(500).json({
    status: 'error',
    message: '服务器内部错误'
  });
};
```

**关键点**：

1. 错误处理中间件必须有 **4个参数**
2. 必须放在所有路由**之后**
3. 区分开发/生产环境
4. 区分可预期错误和未知错误

---

### 6. 异步错误处理

**问题**：async 函数中的错误不会被 Express 自动捕获

```javascript
// ❌ 错误不会被处理，导致请求挂起
app.get('/users', async (req, res) => {
  const users = await User.findAll();  // 如果这里抛错
  res.json(users);  // 这里永远不会执行
  // 请求会一直挂起直到超时！
});
```

**解决方案1：try-catch**

```javascript
// ✅ 手动 try-catch
app.get('/users', async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
});
```

**解决方案2：asyncHandler 包装器**

```javascript
// utils/asyncHandler.js
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ✅ 使用 asyncHandler
app.get('/users', asyncHandler(async (req, res) => {
  const users = await User.findAll();
  res.json(users);
}));
```

### 🎯 前端类比

这和前端的 async/await 错误处理一样：

```javascript
// 前端类似情况
const fetchUsers = async () => {
  try {
    const { data } = await axios.get('/api/users');
    return data;
  } catch (error) {
    // 处理错误
    console.error(error);
    throw error;
  }
};
```

---

### 7. 错误处理最佳实践

1. **统一错误格式**
```json
{
  "status": "fail",
  "message": "用户不存在"
}
```

2. **使用正确的状态码**
- 400：请求参数错误
- 401：未登录
- 403：无权限
- 404：资源不存在
- 500：服务器错误

3. **记录错误日志**
```javascript
console.error(`[${new Date().toISOString()}] ERROR:`, err);
```

4. **不要暴露敏感信息**
```javascript
// ❌ 危险
res.json({ error: err.stack });

// ✅ 安全
res.json({ error: '服务器内部错误' });
```

---

## 🧪 动手练习

### 练习1：添加产品验证

创建产品验证规则：

```javascript
const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().integer().min(0).default(0),
  category: Joi.string().valid('电子', '服装', '食品').required()
});
```

### 练习2：添加更多错误类型

```javascript
class ConflictError extends AppError {
  constructor(message = '资源冲突') {
    super(message, 409);
  }
}

// 使用场景：邮箱已存在
if (existingUser) {
  throw new ConflictError('邮箱已被注册');
}
```

---

## 📝 本课小结

1. **Joi** 是强大的数据验证库，语法类似前端表单验证
2. **自定义错误类** 让错误处理更加结构化
3. **全局错误处理中间件** 统一返回格式
4. **asyncHandler** 解决异步错误捕获问题
5. 前端验证不能替代后端验证，两者都要做

---

## ➡️ 下一课预告

**第5课：数据库连接（MySQL）**

- 使用 Sequelize ORM 连接 MySQL
- 定义数据模型
- 实现真正的数据持久化
- 数据库迁移

---

## 📦 完整代码

👉 [GitHub - Course_4](https://github.com/Juhao978/node-learning/tree/main/Course_4)
