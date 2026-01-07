const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

/* ============================================
   第7课：文件上传
   ============================================ */

const uploadRoutes = require('./routes/uploadRoutes');
const { UPLOAD_DIR } = require('./config/upload');

// ==========================================
// 确保上传目录存在
// ==========================================

const dirs = ['images', 'videos', 'documents', 'others'];
dirs.forEach(dir => {
  const fullPath = path.join(UPLOAD_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

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

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// 路由
// ==========================================

app.get('/', (req, res) => {
  res.json({
    message: '第7课：文件上传',
    endpoints: {
      singleUpload: 'POST /api/upload',
      multipleUpload: 'POST /api/upload/multiple',
      fieldsUpload: 'POST /api/upload/fields',
      getFiles: 'GET /api/upload/files?type=images',
      deleteFile: 'DELETE /api/upload/files/:type/:filename'
    }
  });
});

app.use('/api/upload', uploadRoutes);

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

const PORT = 3000;
app.listen(PORT, () => {
  console.log('\n🚀 第7课：文件上传服务器已启动');
  console.log(`   地址: http://localhost:${PORT}`);
  console.log(`   测试页面: http://localhost:${PORT}/test.html`);
  console.log('\n📁 上传目录:', UPLOAD_DIR);
  console.log('   - images/    图片');
  console.log('   - videos/    视频');
  console.log('   - documents/ 文档');
});

