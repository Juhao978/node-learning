const express = require('express');
const path = require('path');
const app = express();

/* ============================================
   第5课：数据库连接（MySQL/SQLite + Sequelize）
   ============================================ */

const { testConnection } = require('./config/database');
const { syncDatabase } = require('./models');
const userRoutes = require('./routes/userRoutes');

// ==========================================
// 中间件配置
// ==========================================

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());
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
    message: '第5课：数据库连接',
    features: ['Sequelize ORM', 'SQLite/MySQL', '数据持久化', 'CRUD 操作']
  });
});

app.use('/api/users', userRoutes);

// ==========================================
// 错误处理
// ==========================================

app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(500).json({ error: err.message });
});

// ==========================================
// 启动服务器
// ==========================================

const startServer = async () => {
  // 1. 测试数据库连接
  await testConnection();
  
  // 2. 同步数据库表
  await syncDatabase();
  
  // 3. 启动服务器
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log('\n🚀 第5课：数据库课程服务器已启动');
    console.log(`   地址: http://localhost:${PORT}`);
    console.log(`   测试页面: http://localhost:${PORT}/test.html`);
    console.log('\n📂 数据库文件: database.sqlite');
    console.log('   所有数据会持久化保存，重启服务器数据不会丢失！');
  });
};

startServer();

