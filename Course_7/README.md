# 第7课：文件上传

## 📚 本课学习目标

- 使用 multer 处理文件上传
- 配置文件存储和命名
- 实现文件大小和类型限制
- 处理单文件和多文件上传

---

## 🚀 快速开始

```bash
cd Course_7/my-node-api
pnpm install
pnpm start
# 访问 http://localhost:3000/test.html
```

---

## 📖 知识点详解

### 1. 文件上传原理

前端发送文件使用 **multipart/form-data** 格式：

```javascript
// 前端代码
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/upload', {
  method: 'POST',
  body: formData  // 不要手动设置 Content-Type！
});
```

**为什么不能设置 Content-Type？**

浏览器会自动设置 `Content-Type: multipart/form-data; boundary=----xxx`，其中 `boundary` 是用来分隔多个字段的随机字符串。手动设置会导致 boundary 丢失。

### 🎯 前端类比

这和你使用 axios 上传文件一样：

```javascript
// axios 方式
const formData = new FormData();
formData.append('file', file);

axios.post('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'  // 可省略，axios 会自动设置
  }
});
```

---

### 2. Multer 简介

**Multer** 是 Express 官方推荐的文件上传中间件。

#### 安装

```bash
pnpm add multer
```

#### 基本用法

```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// 单文件上传
app.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.file);  // 上传的文件信息
  res.json({ file: req.file });
});
```

---

### 3. uuid 库简介

**uuid**（Universally Unique Identifier）用于生成唯一标识符，在文件上传中常用于生成不重复的文件名。

#### 安装

```bash
pnpm add uuid
```

#### 基本用法

```javascript
const { v4: uuidv4 } = require('uuid');

// 生成 UUID v4（随机 UUID）
const id = uuidv4();
console.log(id);  // 例如: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
```

#### UUID 版本对比

| 版本 | 特点 | 使用场景 |
|-----|------|---------|
| `v1` | 基于时间戳 + MAC 地址 | 需要时间排序的场景 |
| `v4` | 完全随机（最常用）| 文件命名、数据库主键 |
| `v5` | 基于命名空间 + 名称 | 确定性 UUID |

#### 在文件上传中的应用

```javascript
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// 生成唯一文件名
const generateFilename = (originalname) => {
  const ext = path.extname(originalname);  // 获取扩展名
  return `${uuidv4()}${ext}`;               // uuid + 扩展名
  // 例如: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed.jpg'
};
```

### 🎯 前端类比

这类似于前端生成唯一 key：

```javascript
// 前端生成唯一 ID
const items = data.map(item => ({
  ...item,
  key: crypto.randomUUID()  // 浏览器原生 API
}));

// uuid 库在 Node.js 中提供相同功能
```

---

### 4. 存储配置

默认情况下，multer 会生成随机文件名，没有扩展名。我们需要自定义存储：

```javascript
const storage = multer.diskStorage({
  // 存储目录
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  
  // 文件命名
  filename: (req, file, cb) => {
    // 保留原始扩展名
    const ext = path.extname(file.originalname);
    // 使用时间戳 + 随机数命名
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });
```

---

### 5. 文件过滤

只允许特定类型的文件：

```javascript
const fileFilter = (req, file, cb) => {
  // 允许的类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);   // 接受文件
  } else {
    cb(new Error('不支持的文件类型'), false);  // 拒绝文件
  }
};

const upload = multer({ storage, fileFilter });
```

### 🎯 前端类比

这就像 `<input type="file" accept="image/*">` 的后端版本：

```html
<!-- 前端限制（可被绕过） -->
<input type="file" accept="image/*,.pdf">

<!-- 后端限制（安全） -->
```

前端限制只是 UX 优化，后端限制才是真正的安全措施。

---

### 6. 文件大小限制

```javascript
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5MB
    files: 10                    // 最多 10 个文件
  }
});
```

超过限制会抛出 `MulterError`。

---

### 7. 上传方式

#### 单文件上传

```javascript
// 'file' 是表单字段名
app.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.file);
  // {
  //   fieldname: 'file',
  //   originalname: '头像.jpg',
  //   encoding: '7bit',
  //   mimetype: 'image/jpeg',
  //   destination: 'uploads/',
  //   filename: '1699xxx.jpg',
  //   path: 'uploads/1699xxx.jpg',
  //   size: 123456
  // }
});
```

#### 多文件上传（同一字段）

```javascript
// 最多 5 个文件
app.post('/upload', upload.array('files', 5), (req, res) => {
  console.log(req.files);  // 文件数组
});
```

#### 多文件上传（不同字段）

```javascript
app.post('/upload', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'photos', maxCount: 5 }
]), (req, res) => {
  console.log(req.files.avatar);   // 头像
  console.log(req.files.photos);   // 照片数组
});
```

---

### 8. 错误处理

Multer 错误需要特殊处理：

```javascript
const multer = require('multer');

const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer 错误
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ error: '文件太大' });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ error: '文件数量超限' });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ error: '字段名错误' });
    }
  }
  
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  
  next();
};

// 使用
app.post('/upload',
  upload.single('file'),
  uploadErrorHandler,
  controller.upload
);
```

---

### 9. 静态文件服务

让上传的文件可以被访问：

```javascript
// 将 uploads 目录映射到 /uploads 路径
app.use('/uploads', express.static('uploads'));

// 访问方式：http://localhost:3000/uploads/xxx.jpg
```

### 🎯 前端类比

这类似于 Vite 的 `public` 目录：

```
public/
└── images/
    └── logo.png  → 访问 /images/logo.png
```

---

### 10. 安全注意事项

1. **验证文件类型**
```javascript
// ❌ 只检查扩展名（不安全）
if (file.originalname.endsWith('.jpg')) { ... }

// ✅ 检查 MIME 类型
if (file.mimetype === 'image/jpeg') { ... }
```

2. **限制文件大小**
```javascript
limits: { fileSize: 5 * 1024 * 1024 }
```

3. **使用随机文件名**
```javascript
// 避免文件名冲突和路径遍历攻击
filename: `${uuid()}${ext}`
```

4. **上传目录权限**
```javascript
// 不要放在代码目录下
// ❌ ./src/uploads
// ✅ /var/uploads
```

5. **病毒扫描**（生产环境）
```javascript
// 使用 ClamAV 等工具扫描上传的文件
```

---

## 🧪 动手练习

### 练习1：添加图片压缩

使用 sharp 库压缩上传的图片：

```javascript
const sharp = require('sharp');

const compressImage = async (req, res, next) => {
  if (!req.file || !req.file.mimetype.startsWith('image/')) {
    return next();
  }
  
  const outputPath = req.file.path.replace(/\.\w+$/, '.webp');
  
  await sharp(req.file.path)
    .resize(800, 800, { fit: 'inside' })
    .webp({ quality: 80 })
    .toFile(outputPath);
  
  // 删除原文件
  fs.unlinkSync(req.file.path);
  
  req.file.path = outputPath;
  req.file.filename = path.basename(outputPath);
  
  next();
};
```

### 练习2：上传到云存储

使用 AWS S3：

```javascript
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'my-bucket',
    key: (req, file, cb) => {
      cb(null, `uploads/${Date.now()}-${file.originalname}`);
    }
  })
});
```

---

## 📝 本课小结

1. **multer** 是 Express 文件上传的标准解决方案
2. **diskStorage** 自定义文件存储位置和命名
3. **fileFilter** 限制文件类型
4. **limits** 限制文件大小和数量
5. **静态文件服务** 让上传的文件可被访问
6. 前端验证是 UX，**后端验证是安全**

---

## ➡️ 下一课预告

**第8课：项目实战整合**

- 整合前面所学的所有知识
- 构建完整的博客 API
- 用户认证 + 文章 CRUD + 评论系统
- 项目部署准备

---

## 📦 完整代码

- [GitHub - Course_7](https://github.com/Juhao978/node-learning/tree/main/Course_7)
- [Gitee - Course_7](https://gitee.com/Juhao978/node-learning/tree/main/Course_7)
