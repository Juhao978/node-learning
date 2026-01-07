# 第6课：用户认证（JWT）

## 📚 本课学习目标

- 理解 JWT 工作原理
- 实现密码加密存储
- 实现登录注册功能
- 保护需要认证的接口
- 实现基于角色的权限控制

---

## 🚀 快速开始

```bash
cd Course_6/my-node-api
pnpm install
pnpm start
# 访问 http://localhost:3000/test.html
```

---

## 📖 知识点详解

### 1. 什么是 JWT？

**JWT**（JSON Web Token）是一种开放标准（RFC 7519），用于在各方之间安全地传输信息。

#### JWT 结构

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYzNjk0MzM1OH0.H5p7p8TqO1H8F7rZ3KsOJVQmJpS6fJ8NxOvX
|___________________________________|__|_______________________________|__|__________________________________________|
           Header (头部)                         Payload (载荷)                        Signature (签名)
```

**三个部分**：

1. **Header**（头部）：算法和类型
```json
{ "alg": "HS256", "typ": "JWT" }
```

2. **Payload**（载荷）：携带的数据
```json
{ "userId": 1, "iat": 1636943358, "exp": 1636946958 }
```

3. **Signature**（签名）：验证数据完整性
```
HMACSHA256(base64(header) + "." + base64(payload), secret)
```

### 🎯 前端类比

你一定在前端这样存储和使用过 token：

```javascript
// 登录后存储
localStorage.setItem('token', response.data.token);

// 请求时携带
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

现在你学习的就是：**后端如何生成和验证这个 token**！

---

### 2. 认证流程

```
┌──────────┐                          ┌──────────┐
│  客户端   │                          │  服务器   │
└────┬─────┘                          └────┬─────┘
     │                                      │
     │  1. POST /login {email, password}    │
     │ ────────────────────────────────────>│
     │                                      │ 验证用户凭据
     │  2. 返回 {token: "eyJ...", user}     │ 生成 JWT
     │ <────────────────────────────────────│
     │                                      │
存储 token                                   │
     │                                      │
     │  3. GET /me                          │
     │     Header: Authorization: Bearer eyJ│
     │ ────────────────────────────────────>│
     │                                      │ 验证 JWT
     │  4. 返回 {user: {...}}               │ 获取用户信息
     │ <────────────────────────────────────│
     │                                      │
```

---

### 3. 密码加密（bcrypt）

**永远不要明文存储密码！**

```javascript
const bcrypt = require('bcryptjs');

// 加密密码
const salt = await bcrypt.genSalt(10);  // 生成盐
const hashedPassword = await bcrypt.hash('123456', salt);
// 结果：$2a$10$N9qo8uLOickgx2ZMRZoMy...

// 验证密码
const isMatch = await bcrypt.compare('123456', hashedPassword);
// 返回：true 或 false
```

**为什么用 bcrypt？**

1. **单向加密**：无法从哈希值反推密码
2. **加盐**：相同密码产生不同哈希
3. **慢速计算**：增加暴力破解难度

### 🎯 前端类比

这就像你用 crypto-js 加密敏感数据：

```javascript
import CryptoJS from 'crypto-js';
const encrypted = CryptoJS.AES.encrypt('password', 'secret').toString();
```

但 bcrypt 是**单向的**，无法解密，只能验证。

---

### 4. JWT 生成与验证

#### 安装

```bash
pnpm add jsonwebtoken
```

#### 生成 Token

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: 1 },           // payload: 要存储的数据
  'your-secret-key',       // secret: 签名密钥
  { expiresIn: '1h' }      // options: 1小时后过期
);
```

#### 验证 Token

```javascript
try {
  const decoded = jwt.verify(token, 'your-secret-key');
  console.log(decoded);  // { userId: 1, iat: ..., exp: ... }
} catch (error) {
  if (error.name === 'TokenExpiredError') {
    console.log('Token 已过期');
  } else {
    console.log('Token 无效');
  }
}
```

---

### 5. 认证中间件

```javascript
const authenticate = async (req, res, next) => {
  // 1. 从请求头获取 token
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '请提供认证令牌' });
  }
  
  // 2. 提取 token
  const token = authHeader.split(' ')[1];
  
  try {
    // 3. 验证 token
    const decoded = jwt.verify(token, secret);
    
    // 4. 查找用户
    const user = await User.findByPk(decoded.userId);
    
    // 5. 附加到 req 对象
    req.user = user;
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token 无效或已过期' });
  }
};
```

### 🎯 前端类比

这就像 Vue Router 的路由守卫：

```javascript
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});
```

后端中间件做的是同样的事：**检查是否有权限访问**。

---

### 6. 权限控制

```javascript
// 角色检查中间件
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }
    next();
  };
};

// 使用
router.get('/admin', 
  authenticate,           // 先验证登录
  authorize('admin'),     // 再验证权限
  adminController
);

router.delete('/users/:id',
  authenticate,
  authorize('admin', 'superadmin'),  // 允许多个角色
  deleteUser
);
```

---

### 7. Sequelize Hooks（钩子）

在保存用户前自动加密密码：

```javascript
const User = sequelize.define('User', {
  // ... 字段定义
}, {
  hooks: {
    // 创建前自动加密
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    },
    
    // 更新前检查密码是否修改
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});
```

### 🎯 前端类比

这就像 Vue 的生命周期钩子：

```javascript
export default {
  beforeCreate() {
    console.log('组件创建前');
  },
  beforeUpdate() {
    console.log('组件更新前');
  }
}
```

Sequelize 的 hooks 在数据库操作的特定时机执行。

---

### 8. 安全最佳实践

1. **密钥管理**
```javascript
// ❌ 不要硬编码
const secret = 'my-secret';

// ✅ 使用环境变量
const secret = process.env.JWT_SECRET;
```

2. **Token 过期时间**
```javascript
// Access Token: 短期（1小时）
jwt.sign(payload, secret, { expiresIn: '1h' });

// Refresh Token: 长期（7天）
jwt.sign(payload, secret, { expiresIn: '7d' });
```

3. **HTTPS**
- 生产环境必须使用 HTTPS
- 防止 token 被中间人窃取

4. **敏感信息**
```javascript
// ❌ 不要在 token 中存储敏感信息
jwt.sign({ password: '123' }, secret);

// ✅ 只存储必要信息
jwt.sign({ userId: 1 }, secret);
```

---

## 🧪 动手练习

### 练习1：实现刷新 Token

当 Access Token 过期时，用 Refresh Token 换取新的 Access Token：

```javascript
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const decoded = jwt.verify(refreshToken, refreshSecret);
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      accessSecret,
      { expiresIn: '1h' }
    );
    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ error: 'Refresh Token 无效' });
  }
});
```

### 练习2：记住登录状态

根据用户选择设置不同的过期时间：

```javascript
const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;
  
  // ... 验证逻辑
  
  const expiresIn = rememberMe ? '30d' : '1h';
  const token = jwt.sign({ userId: user.id }, secret, { expiresIn });
  
  res.json({ token });
};
```

---

## 📝 本课小结

1. **JWT** 是一种用于认证的令牌格式
2. **bcrypt** 用于密码加密，单向不可逆
3. **认证中间件** 验证 token 并获取用户信息
4. **权限中间件** 检查用户角色
5. **Sequelize Hooks** 可以在数据操作前后执行逻辑

---

## ➡️ 下一课预告

**第7课：文件上传**

- 使用 multer 处理文件上传
- 图片上传和预览
- 文件大小和类型限制
- 存储到本地/云服务

---

## 📦 完整代码

- [GitHub - Course_6](https://github.com/Juhao978/node-learning/tree/main/Course_6)
- [Gitee - Course_6](https://gitee.com/Juhao978/node-learning/tree/main/Course_6)
