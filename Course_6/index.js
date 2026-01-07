const express = require('express');
const path = require('path');
const app = express();

/* ============================================
   第6课：用户认证（JWT）
   ============================================ */

const { sequelize } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// ==========================================
// 中间件配置
// ==========================================

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 路由
// ==========================================

app.get('/', (req, res) => {
  res.json({
    message: '第6课：用户认证（JWT）',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me (需要 Token)',
      users: 'GET /api/users (需要 admin 权限)'
    }
  });
});

app.use('/api/auth', authRoutes);
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
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    await sequelize.sync({ alter: true });
    console.log('✅ 数据库表同步完成');
    
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log('\n🚀 第6课：JWT 认证服务器已启动');
      console.log(`   地址: http://localhost:${PORT}`);
      console.log(`   测试页面: http://localhost:${PORT}/test.html`);
      console.log('\n🔐 认证流程：');
      console.log('   1. 注册 → POST /api/auth/register');
      console.log('   2. 登录 → POST /api/auth/login → 获得 Token');
      console.log('   3. 访问保护接口时带上 Authorization: Bearer <token>');
    });
  } catch (error) {
    console.error('启动失败:', error);
  }
};

startServer();

