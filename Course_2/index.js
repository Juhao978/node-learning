const express = require('express');
const path = require('path');
const app = express();
const { MockUser } = require('./mock_user');

/* ============================================
   第2课：中间件（Middleware）深入理解
   
   本课程代码演示了各种中间件的用法
   详细讲解请查看 README.md
   ============================================ */

// ==========================================
// 【中间件1】请求日志中间件
// ==========================================
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  console.log(`\n📨 [${new Date().toLocaleString()}]`);
  console.log(`   ${req.method} ${req.url}`);
  
  // 监听响应完成事件，计算耗时
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`   ✅ 状态: ${res.statusCode} | 耗时: ${duration}ms`);
  });
  
  next();
};

// ==========================================
// 【中间件2】请求增强中间件
// ==========================================
const requestEnhancer = (req, res, next) => {
  // 给 req 对象添加自定义属性
  req.requestTime = new Date().toISOString();
  req.customData = { source: 'course-2-api', version: '1.0' };
  
  next();
};

// ==========================================
// 【中间件3】CORS 跨域中间件
// ==========================================
const corsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
};

// ==========================================
// 【中间件4】简单的认证中间件（演示用）
// ==========================================
const simpleAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  // 演示：检查是否有 API Key
  if (apiKey === 'secret123') {
    req.isAuthenticated = true;
    req.user = { role: 'admin' };
  } else {
    req.isAuthenticated = false;
    req.user = null;
  }
  
  next(); // 这里不拦截，只标记状态
};

// ==========================================
// 【中间件5】需要认证的路由保护中间件
// ==========================================
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated) {
    return res.status(401).json({ 
      error: '未授权访问',
      message: '请在请求头中添加 x-api-key: secret123'
    });
  }
  next();
};

// ==========================================
// 注册全局中间件（按顺序执行）
// ==========================================
app.use(requestLogger);      // 1. 记录日志
app.use(requestEnhancer);    // 2. 增强请求
app.use(corsMiddleware);     // 3. 处理跨域
app.use(express.json());     // 4. 解析 JSON
app.use(simpleAuth);         // 5. 认证检查

// 托管静态文件（HTML 测试页面）
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 公开路由（无需认证）
// ==========================================

// 首页 - 显示请求增强的效果
app.get('/', (req, res) => {
  res.json({
    message: '欢迎学习中间件课程！',
    requestTime: req.requestTime,
    customData: req.customData,
    isAuthenticated: req.isAuthenticated
  });
});

// 获取所有用户（公开）
app.get('/users', (req, res) => {
  res.json({
    total: MockUser.length,
    data: MockUser
  });
});

// 获取单个用户（公开）
app.get('/users/:id', (req, res) => {
  const user = MockUser.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  res.json(user);
});

// ==========================================
// 受保护路由（需要认证）
// ==========================================

// 创建用户（需要认证）
app.post('/users', requireAuth, (req, res) => {
  const { name, email, age, role } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: '缺少必填字段: name, email' });
  }
  
  const newUser = { 
    id: MockUser.length + 1, 
    name, 
    email, 
    age: age || 0, 
    role: role || 'user' 
  };
  MockUser.push(newUser);
  res.status(201).json(newUser);
});

// 更新用户（需要认证）
app.put('/users/:id', requireAuth, (req, res) => {
  const user = MockUser.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const { name, email, age, role } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (age !== undefined) user.age = age;
  if (role) user.role = role;
  
  res.json(user);
});

// 删除用户（需要认证）
app.delete('/users/:id', requireAuth, (req, res) => {
  const index = MockUser.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: '用户不存在' });
  }
  MockUser.splice(index, 1);
  res.sendStatus(204);
});

// ==========================================
// 404 处理（放在所有路由之后）
// ==========================================
app.use((req, res, next) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.url,
    method: req.method
  });
});

// ==========================================
// 错误处理中间件（必须4个参数，放在最后）
// ==========================================
app.use((err, req, res, next) => {
  console.error('❌ 错误:', err.message);
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message
  });
});

// ==========================================
// 启动服务器
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log('\n🚀 第2课：中间件课程服务器已启动');
  console.log(`   地址: http://localhost:${PORT}`);
  console.log(`   测试页面: http://localhost:${PORT}/test.html`);
  console.log('\n📝 测试接口：');
  console.log('   公开接口:');
  console.log('   - GET  /');
  console.log('   - GET  /users');
  console.log('   - GET  /users/:id');
  console.log('\n   需要认证的接口（请求头 x-api-key: secret123）:');
  console.log('   - POST   /users');
  console.log('   - PUT    /users/:id');
  console.log('   - DELETE /users/:id');
});

