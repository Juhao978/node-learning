const express = require('express');
const path = require('path');
const app = express();

/* ============================================
   第4课：数据验证 & 错误处理
   ============================================ */

// 引入中间件和路由
const errorHandler = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');
const { NotFoundError } = require('./utils/AppError');

// ==========================================
// 中间件配置
// ==========================================

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// 解析 JSON
app.use(express.json());

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.url}`);
  next();
});

// ==========================================
// 路由
// ==========================================

app.get('/', (req, res) => {
  res.json({
    message: '第4课：数据验证 & 错误处理',
    features: ['Joi 验证', '自定义错误类', '统一错误处理', '异步错误捕获']
  });
});

app.use('/api/users', userRoutes);

// 模拟错误的测试接口
app.get('/api/error-test', (req, res, next) => {
  // 模拟一个未处理的错误
  throw new Error('这是一个测试错误');
});

app.get('/api/async-error', async (req, res, next) => {
  // 模拟异步错误
  await Promise.reject(new Error('异步操作失败'));
});

// ==========================================
// 404 处理
// ==========================================
app.use((req, res, next) => {
  next(new NotFoundError(`接口 ${req.method} ${req.url} 不存在`));
});

// ==========================================
// 全局错误处理（必须放在最后）
// ==========================================
app.use(errorHandler);

// ==========================================
// 启动服务器
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log('\n🚀 第4课：数据验证 & 错误处理服务器已启动');
  console.log(`   地址: http://localhost:${PORT}`);
  console.log(`   测试页面: http://localhost:${PORT}/test.html`);
  console.log('\n📝 测试验证功能：');
  console.log('   尝试创建用户时不填姓名或邮箱，观察错误提示');
});

