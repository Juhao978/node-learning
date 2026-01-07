# 第8课：项目实战 - 博客 API

## 🎉 恭喜你完成 Node.js 入门课程！

这是你的毕业项目，整合了前面 7 课学到的所有知识。

---

## 📚 课程回顾

```
├── 第1课：Express 基础 & RESTful API
│   ✅ 创建服务器、定义路由、处理请求和响应
│
├── 第2课：中间件
│   ✅ 理解中间件概念、next() 函数、CORS 处理
│
├── 第3课：路由模块化 & MVC 架构
│   ✅ 项目结构组织、分层架构、express.Router()
│
├── 第4课：数据验证 & 错误处理
│   ✅ Joi 验证、自定义错误类、统一错误处理
│
├── 第5课：数据库连接
│   ✅ Sequelize ORM、模型定义、CRUD 操作
│
├── 第6课：用户认证
│   ✅ JWT、密码加密、认证中间件、权限控制
│
├── 第7课：文件上传
│   ✅ multer、文件存储、类型限制
│
└── 第8课：项目实战 ← 你在这里
    🎯 整合所有知识，构建完整的博客 API
```

---

## 🚀 快速开始

```bash
cd Course_8/my-node-api
pnpm install
pnpm start
# 访问 http://localhost:3000/test.html
```

---

## 📋 API 接口文档

### 认证接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | ❌ |
| POST | /api/auth/login | 用户登录 | ❌ |
| GET | /api/auth/me | 获取当前用户 | ✅ |
| PUT | /api/auth/profile | 更新个人资料 | ✅ |

### 文章接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/articles | 获取文章列表 | ❌ |
| GET | /api/articles/:id | 获取文章详情 | ❌ |
| POST | /api/articles | 创建文章 | ✅ |
| PUT | /api/articles/:id | 更新文章 | ✅ |
| DELETE | /api/articles/:id | 删除文章 | ✅ |
| GET | /api/articles/user/my | 获取我的文章 | ✅ |

### 评论接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/articles/:id/comments | 获取评论列表 | ❌ |
| POST | /api/articles/:id/comments | 发表评论 | ✅ |
| DELETE | /api/articles/comments/:id | 删除评论 | ✅ |

---

## 📁 项目结构

```
Course_8/my-node-api/
├── index.js              # 入口文件
├── package.json          # 依赖配置
├── blog.sqlite           # SQLite 数据库文件
│
├── config/               # 配置文件
│   ├── database.js       # 数据库配置
│   └── jwt.js            # JWT 配置
│
├── models/               # 数据模型
│   ├── index.js          # 模型索引和关联
│   ├── User.js           # 用户模型
│   ├── Article.js        # 文章模型
│   └── Comment.js        # 评论模型
│
├── controllers/          # 控制器
│   ├── authController.js
│   ├── articleController.js
│   └── commentController.js
│
├── routes/               # 路由
│   ├── authRoutes.js
│   └── articleRoutes.js
│
├── middleware/           # 中间件
│   └── auth.js           # 认证中间件
│
└── public/               # 静态文件
    └── test.html         # 测试页面
```

---

## 🔧 技术栈

| 技术 | 用途 |
|------|------|
| Express | Web 框架 |
| Sequelize | ORM |
| SQLite | 数据库 |
| JWT | 身份认证 |
| bcryptjs | 密码加密 |
| Joi | 数据验证 |
| multer | 文件上传 |

---

## 🎯 你学到了什么

### 1. 后端开发基础

- HTTP 协议和 RESTful API 设计
- 请求/响应处理
- 路由和中间件

### 2. 数据库操作

- ORM 概念和 Sequelize 使用
- 模型定义和关联
- CRUD 操作

### 3. 安全相关

- 密码加密存储
- JWT 认证机制
- 权限控制

### 4. 工程化

- 项目结构组织
- 分层架构
- 错误处理

---

## 🚀 下一步学习建议

### 1. 深入学习

- **TypeScript**：为 Node.js 添加类型安全
- **NestJS**：更强大的 Node.js 框架
- **GraphQL**：替代 RESTful 的 API 方案

### 2. 数据库

- **MySQL/PostgreSQL**：生产级关系型数据库
- **MongoDB**：NoSQL 数据库
- **Redis**：缓存和会话存储

### 3. 运维部署

- **Docker**：容器化部署
- **PM2**：Node.js 进程管理
- **Nginx**：反向代理和负载均衡
- **云服务**：阿里云、腾讯云、AWS

### 4. 高级话题

- **WebSocket**：实时通信
- **消息队列**：RabbitMQ、Redis
- **微服务**：服务拆分和通信
- **性能优化**：缓存、索引、分页

---

## 🎓 毕业小结

经过这 8 课的学习，你已经：

1. ✅ 理解了 Node.js 和 Express 的工作原理
2. ✅ 掌握了 RESTful API 的设计规范
3. ✅ 学会了使用 ORM 操作数据库
4. ✅ 实现了完整的用户认证系统
5. ✅ 能够独立构建一个完整的后端项目

**作为前端开发者，你现在拥有了全栈开发的能力！**

继续加油，在实际项目中不断练习和成长！🚀

---

## 📝 练习建议

1. **扩展功能**
   - 添加文章分类和标签
   - 实现文章点赞功能
   - 添加用户关注功能
   - 实现文章搜索

2. **前端对接**
   - 用 Vue/React 构建前端界面
   - 实现完整的博客系统

3. **部署上线**
   - 将项目部署到云服务器
   - 配置域名和 HTTPS

祝你学习愉快！🎉

---

## 📦 完整代码

👉 [GitHub - Course_8](https://github.com/Juhao978/node-learning/tree/main/Course_8)
