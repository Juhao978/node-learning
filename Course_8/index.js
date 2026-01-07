const express = require('express');
const path = require('path');
const app = express();

/* ============================================
   第8课：项目实战 - 博客 API
   
   整合了前面所学的所有知识：
   - Express 基础
   - MVC 架构
   - 数据验证
   - 数据库操作
   - JWT 认证
   - 文件上传
   ============================================ */

const { sequelize, syncDatabase } = require('./models');
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.url}`);
  next();
});

// ==========================================
// API 路由
// ==========================================

app.get('/', (req, res) => {
  res.json({
    message: '🎉 博客 API - 项目实战',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        updateProfile: 'PUT /api/auth/profile'
      },
      articles: {
        list: 'GET /api/articles',
        detail: 'GET /api/articles/:id',
        create: 'POST /api/articles',
        update: 'PUT /api/articles/:id',
        delete: 'DELETE /api/articles/:id',
        myArticles: 'GET /api/articles/user/my'
      },
      comments: {
        list: 'GET /api/articles/:id/comments',
        create: 'POST /api/articles/:id/comments',
        delete: 'DELETE /api/articles/comments/:id'
      }
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);

// ==========================================
// 错误处理
// ==========================================

app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

app.use((err, req, res, next) => {
  console.error('❌ 错误:', err);
  res.status(500).json({ error: err.message });
});

// ==========================================
// 启动服务器
// ==========================================

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    await syncDatabase();
    
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log('\n🎉 第8课：博客 API 服务器已启动');
      console.log(`   地址: http://localhost:${PORT}`);
      console.log(`   测试页面: http://localhost:${PORT}/test.html`);
      console.log('\n📚 这是你的毕业项目！');
      console.log('   它整合了前面 7 课学到的所有知识。');
    });
  } catch (error) {
    console.error('启动失败:', error);
  }
};

startServer();

