const express = require('express');
const path = require('path');
const app = express();
const { MockUser } = require('./mock_user');

/* ============================================
   第1课：Express 基础 & RESTful API
   
   本课程学习目标：
   - 理解什么是 Express
   - 理解什么是 RESTful API
   - 掌握基本的 CRUD 操作
   
   详细讲解请查看 README.md
   ============================================ */

// ==========================================
// 中间件配置
// ==========================================

// CORS 跨域处理
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// 解析 JSON 请求体
app.use(express.json());

// 托管静态文件（让 HTML 可以直接访问）
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 路由定义 - RESTful API
// ==========================================

// GET / - 首页
app.get('/', (req, res) => {
  res.send('Hello, Node.js! 访问 /test.html 可以测试 API');
});

// GET /users - 获取所有用户
app.get('/users', (req, res) => {
  res.json(MockUser);
});

// GET /users/:id - 获取单个用户
app.get('/users/:id', (req, res) => {
  const user = MockUser.find(user => user.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /users - 创建用户
app.post('/users', (req, res) => {
  const { name, email, age, role } = req.body;
  const newUser = { id: MockUser.length + 1, name, email, age, role };
  MockUser.push(newUser);
  res.status(201).json(newUser);
});

// PUT /users/:id - 更新用户
app.put('/users/:id', (req, res) => {
  const { name, email, age, role } = req.body;
  const user = MockUser.find(user => user.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.name = name;
  user.email = email;
  user.age = age;
  user.role = role;
  res.json(user);
});

// DELETE /users/:id - 删除用户
app.delete('/users/:id', (req, res) => {
  const index = MockUser.findIndex(user => user.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  MockUser.splice(index, 1);
  res.sendStatus(204);
});

// ==========================================
// 启动服务器
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log('\n🚀 第1课：Express 基础服务器已启动');
  console.log(`   地址: http://localhost:${PORT}`);
  console.log(`   测试页面: http://localhost:${PORT}/test.html`);
  console.log('\n📝 API 接口：');
  console.log('   GET    /users      - 获取所有用户');
  console.log('   GET    /users/:id  - 获取单个用户');
  console.log('   POST   /users      - 创建用户');
  console.log('   PUT    /users/:id  - 更新用户');
  console.log('   DELETE /users/:id  - 删除用户');
});
