const express = require('express');
const path = require('path');
const app = express();

/* ============================================
   第3课：路由模块化 & MVC 架构
   
   本课程学习目标：
   - 理解 MVC 架构模式
   - 使用 express.Router() 模块化路由
   - 掌握项目目录结构最佳实践
   
   详细讲解请查看 README.md
   ============================================ */

// ==========================================
// 引入路由模块
// ==========================================
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

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
// 注册路由
// ==========================================
app.use('/api/users', userRoutes);      // 用户相关路由
app.use('/api/products', productRoutes); // 产品相关路由

// 首页
app.get('/', (req, res) => {
  res.json({
    message: '第3课：路由模块化 & MVC 架构',
    endpoints: {
      users: '/api/users',
      products: '/api/products'
    }
  });
});

// ==========================================
// 404 处理
// ==========================================
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// ==========================================
// 错误处理
// ==========================================
app.use((err, req, res, next) => {
  console.error('错误:', err.message);
  res.status(500).json({ error: err.message });
});

// ==========================================
// 启动服务器
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log('\n🚀 第3课：MVC 架构服务器已启动');
  console.log(`   地址: http://localhost:${PORT}`);
  console.log(`   测试页面: http://localhost:${PORT}/test.html`);
  console.log('\n📁 项目结构：');
  console.log('   routes/      - 路由层');
  console.log('   controllers/ - 控制器层');
  console.log('   models/      - 模型层');
});

