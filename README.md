# Node.js 后端开发学习课程

> 从前端视角学习 Node.js 服务端开发

---

## 📚 课程目录

| 课程 | 主题 | 核心知识点 |
|------|------|-----------|
| **Course_1** | Express 基础 & RESTful API | Express、路由、HTTP 方法、CRUD |
| **Course_2** | 中间件（Middleware） | next()、CORS、错误处理中间件 |
| **Course_3** | 路由模块化 & MVC 架构 | express.Router()、分层架构 |
| **Course_4** | 数据验证 & 错误处理 | Joi 验证、自定义错误类 |
| **Course_5** | 数据库连接 | Sequelize ORM、SQLite/MySQL |
| **Course_6** | 用户认证（JWT） | bcrypt 加密、JWT、权限控制 |
| **Course_7** | 文件上传 | multer、文件存储、类型限制 |
| **Course_8** | 项目实战 | 博客 API（整合所有知识） |

---

## 🚀 如何学习

### 1. 按顺序学习

```bash
# 进入课程目录
cd Course_1

# 安装依赖
pnpm install

# 启动服务器
pnpm start

# 浏览器打开测试页面
http://localhost:3000/test.html
```

### 2. 阅读 README

每个课程目录下的 `README.md` 包含：
- 知识点详解
- 前端概念类比
- 操作步骤
- 练习题

### 3. 动手实践

- 运行代码，观察效果
- 修改代码，理解原理
- 完成练习题

---

## 🎯 学习目标

完成全部课程后，你将能够：

1. ✅ 独立搭建 Express 服务器
2. ✅ 设计 RESTful API
3. ✅ 使用 ORM 操作数据库
4. ✅ 实现用户认证系统
5. ✅ 处理文件上传
6. ✅ 构建完整的后端项目

---

## 📁 目录结构说明

```
node-learning/
├── Course_1/          # 每个课程是独立项目
│   ├── index.js       # 入口文件
│   ├── package.json   # 依赖配置
│   ├── README.md      # 课程讲解
│   ├── public/        # 静态文件
│   │   └── test.html  # 测试页面
│   └── .gitignore     # Git 忽略配置
├── Course_2/
│   └── ...
└── README.md          # 本文件
```

---

## 💡 学习建议

1. **先读后做**：先阅读 README 理解概念，再运行代码
2. **多做实验**：修改代码看看会发生什么
3. **联系前端**：思考后端概念和前端的对应关系
4. **完成练习**：每课结尾的练习题能加深理解

祝学习愉快！🎉

