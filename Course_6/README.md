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

### 3. bcryptjs 库详解

#### 安装

```bash
pnpm add bcryptjs
```

> **为什么用 bcryptjs 而不是 bcrypt？**
> - `bcrypt` 是原生模块，需要编译 C++ 代码，Windows 上可能报错
> - `bcryptjs` 是纯 JavaScript 实现，无需编译，100% 兼容

#### 基本用法

```javascript
const bcrypt = require('bcryptjs');

// ==================== 加密密码 ====================

// 方式1：异步（推荐）
const salt = await bcrypt.genSalt(10);  // 生成盐
const hashedPassword = await bcrypt.hash('123456', salt);
// 结果：$2a$10$N9qo8uLOickgx2ZMRZoMy...

// 方式2：同步（阻塞，不推荐用于服务器）
const saltSync = bcrypt.genSaltSync(10);
const hashedSync = bcrypt.hashSync('123456', saltSync);

// 方式3：一步到位
const hashed = await bcrypt.hash('123456', 10);  // 自动生成盐

// ==================== 验证密码 ====================

// 异步
const isMatch = await bcrypt.compare('123456', hashedPassword);
// 返回：true 或 false

// 同步
const isMatchSync = bcrypt.compareSync('123456', hashedPassword);
```

#### genSalt 的 rounds 参数

`rounds`（也叫 cost factor）决定加密的计算量：

| rounds | 大约耗时 | 适用场景 |
|--------|---------|---------|
| 8 | ~40ms | 开发测试 |
| 10 | ~100ms | **生产推荐** |
| 12 | ~400ms | 高安全要求 |
| 14 | ~1.5s | 极高安全（会影响性能） |

```javascript
// rounds 越高越安全，但也越慢
const salt = await bcrypt.genSalt(10);  // 推荐值

// rounds 每增加 1，计算时间翻倍
// rounds=10 约 100ms，rounds=11 约 200ms
```

#### 哈希值结构解析

```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
│ │  │  └─────────────────────────────────────────────────────────┘
│ │  │                          哈希结果（31字符）
│ │  └─────────────────────────────────────────────────────────────
│ │                             盐值（22字符）
│ └── cost factor（10）
└──── 算法版本（2a）
```

#### 为什么用 bcrypt？

| 加密方式 | 安全性 | 说明 |
|---------|-------|------|
| 明文存储 | ❌ 极危险 | 数据库泄露 = 密码泄露 |
| MD5/SHA | ❌ 不安全 | 可通过彩虹表破解 |
| SHA + 盐 | ⚠️ 一般 | 手动加盐，容易出错 |
| bcrypt | ✅ 推荐 | 自动加盐，慢速计算，防暴力破解 |

### 🎯 前端类比

```javascript
// 前端：crypto-js 加密（可逆）
import CryptoJS from 'crypto-js';
const encrypted = CryptoJS.AES.encrypt('password', 'secret').toString();
const decrypted = CryptoJS.AES.decrypt(encrypted, 'secret').toString();

// 后端：bcrypt 加密（不可逆）
// 只能验证，无法解密出原始密码
const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
```

---

### 4. jsonwebtoken 库详解

#### 安装

```bash
pnpm add jsonwebtoken
```

#### jwt.sign() - 生成 Token

```javascript
const jwt = require('jsonwebtoken');

// 基本用法
const token = jwt.sign(
  { userId: 1, role: 'admin' },  // payload: 存储的数据
  'your-secret-key',              // secret: 签名密钥
  { expiresIn: '1h' }             // options: 选项
);
```

**sign() 完整选项**：

| 选项 | 类型 | 说明 | 示例 |
|-----|------|------|------|
| `expiresIn` | string/number | 过期时间 | `'1h'`, `'7d'`, `3600` |
| `notBefore` | string/number | 生效时间 | `'10s'`（10秒后生效） |
| `audience` | string | 接收方标识 | `'my-app'` |
| `issuer` | string | 签发者标识 | `'auth-server'` |
| `subject` | string | 主题 | `'user-auth'` |
| `jwtid` | string | Token 唯一 ID | `uuid()` |
| `algorithm` | string | 签名算法 | `'HS256'`（默认） |

```javascript
// 完整选项示例
const token = jwt.sign(
  { userId: 1 },
  process.env.JWT_SECRET,
  {
    expiresIn: '1h',           // 1小时后过期
    issuer: 'my-app',          // 签发者
    audience: 'my-users',      // 接收者
    subject: 'authentication', // 主题
    algorithm: 'HS256'         // 算法
  }
);
```

**时间格式**：

```javascript
// 字符串格式
{ expiresIn: '10s' }   // 10秒
{ expiresIn: '5m' }    // 5分钟
{ expiresIn: '1h' }    // 1小时
{ expiresIn: '7d' }    // 7天
{ expiresIn: '2w' }    // 2周

// 数字格式（秒）
{ expiresIn: 3600 }    // 1小时
{ expiresIn: 60 * 60 * 24 * 7 }  // 7天
```

#### jwt.verify() - 验证 Token

```javascript
try {
  const decoded = jwt.verify(token, 'your-secret-key');
  console.log(decoded);
  // {
  //   userId: 1,
  //   iat: 1636943358,  // 签发时间（issued at）
  //   exp: 1636946958   // 过期时间（expiration）
  // }
} catch (error) {
  console.log(error.name, error.message);
}
```

**verify() 选项**：

```javascript
const decoded = jwt.verify(token, secret, {
  algorithms: ['HS256'],      // 允许的算法
  audience: 'my-users',       // 验证接收方
  issuer: 'my-app',           // 验证签发者
  ignoreExpiration: false,    // 是否忽略过期
  clockTolerance: 30          // 时钟容差（秒）
});
```

**错误类型**：

| 错误名 | 说明 | 处理方式 |
|-------|------|---------|
| `TokenExpiredError` | Token 已过期 | 提示重新登录 / 刷新 Token |
| `JsonWebTokenError` | Token 无效（格式错误/签名错误） | 提示 Token 无效 |
| `NotBeforeError` | Token 还未生效 | 提示稍后再试 |

```javascript
try {
  const decoded = jwt.verify(token, secret);
} catch (error) {
  switch (error.name) {
    case 'TokenExpiredError':
      return res.status(401).json({ 
        error: 'Token 已过期',
        expiredAt: error.expiredAt 
      });
    case 'JsonWebTokenError':
      return res.status(401).json({ 
        error: 'Token 无效' 
      });
    case 'NotBeforeError':
      return res.status(401).json({ 
        error: 'Token 还未生效',
        date: error.date 
      });
  }
}
```

#### jwt.decode() - 解码（不验证）

```javascript
// 只解码，不验证签名（不安全，仅用于调试）
const payload = jwt.decode(token);
console.log(payload);  // { userId: 1, iat: ..., exp: ... }

// 获取完整信息（包括 header）
const complete = jwt.decode(token, { complete: true });
console.log(complete);
// {
//   header: { alg: 'HS256', typ: 'JWT' },
//   payload: { userId: 1, ... },
//   signature: 'xxx...'
// }
```

> ⚠️ **注意**：`decode()` 不验证签名，任何人都可以伪造。只用于调试，不要用于认证逻辑！

#### 签名算法

| 算法 | 类型 | 密钥 | 使用场景 |
|-----|------|------|---------|
| HS256 | 对称 | 共享密钥 | 单服务器（推荐） |
| HS384 | 对称 | 共享密钥 | 更高安全性 |
| HS512 | 对称 | 共享密钥 | 最高安全性 |
| RS256 | 非对称 | 公钥/私钥 | 微服务、第三方验证 |
| ES256 | 非对称 | 公钥/私钥 | 移动端、IoT |

```javascript
// HS256（默认，推荐单服务器使用）
const token = jwt.sign(payload, 'shared-secret', { algorithm: 'HS256' });

// RS256（非对称，适合分布式）
const privateKey = fs.readFileSync('private.key');
const publicKey = fs.readFileSync('public.key');

const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
```

### 🎯 前端类比

```javascript
// 前端存储和使用 Token
// 你已经很熟悉了！

// 存储
localStorage.setItem('token', token);

// 使用
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 检查过期（前端解码，不验证）
const payload = JSON.parse(atob(token.split('.')[1]));
if (payload.exp * 1000 < Date.now()) {
  console.log('Token 已过期');
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
