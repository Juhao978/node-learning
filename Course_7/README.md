# 第7课：文件上传

## 📚 本课学习目标

- 使用 multer 处理文件上传
- 配置文件存储和命名
- 实现文件大小和类型限制
- 处理单文件和多文件上传

---

## 🚀 快速开始

```bash
cd Course_7
pnpm install
pnpm start
# 访问 http://localhost:3000/test.html
```

---

## 📦 本课使用的第三方库

| 库名 | 版本 | 用途 |
|------|------|------|
| `express` | ^5.2.1 | Web 框架 |
| `multer` | ^1.4.5-lts.1 | 文件上传处理 |
| `uuid` | ^9.0.1 | 生成唯一标识符 |

---

## 📖 知识点详解

### 1. Node.js 内置模块

在文件上传中，我们需要用到 Node.js 的两个内置模块：`path` 和 `fs`。

#### 1.1 path 模块 - 路径处理

`path` 模块用于处理文件和目录路径，是跨平台开发必备的模块。

```javascript
const path = require('path');

// ==========================================
// 常用方法
// ==========================================

// 1. path.join() - 拼接路径（自动处理分隔符）
path.join('uploads', 'images', 'photo.jpg');
// Windows: 'uploads\\images\\photo.jpg'
// Linux/Mac: 'uploads/images/photo.jpg'

// 2. path.resolve() - 解析为绝对路径
path.resolve('uploads');  
// 'E:\\Gyf\\code\\study\\node-learning\\Course_7\\uploads'

// 3. path.extname() - 获取扩展名
path.extname('photo.jpg');        // '.jpg'
path.extname('archive.tar.gz');   // '.gz'
path.extname('no-extension');     // ''

// 4. path.basename() - 获取文件名
path.basename('/uploads/images/photo.jpg');        // 'photo.jpg'
path.basename('/uploads/images/photo.jpg', '.jpg'); // 'photo'（去掉扩展名）

// 5. path.dirname() - 获取目录名
path.dirname('/uploads/images/photo.jpg');  // '/uploads/images'

// 6. path.parse() - 解析路径为对象
path.parse('/uploads/images/photo.jpg');
// {
//   root: '/',
//   dir: '/uploads/images',
//   base: 'photo.jpg',
//   ext: '.jpg',
//   name: 'photo'
// }

// 7. __dirname - 当前文件所在目录（Node.js 全局变量）
console.log(__dirname);  // 'E:\\Gyf\\code\\study\\node-learning\\Course_7'

// 8. __filename - 当前文件的完整路径
console.log(__filename); // 'E:\\Gyf\\code\\study\\node-learning\\Course_7\\index.js'
```

#### 🎯 前端类比

```javascript
// 前端中类似的操作
const url = new URL('https://example.com/path/to/file.jpg');
url.pathname;   // '/path/to/file.jpg'
url.hostname;   // 'example.com'

// path 模块是处理文件路径的，URL 是处理网络地址的
```

#### 1.2 fs 模块 - 文件系统操作

`fs`（File System）模块用于读写文件和操作目录。

```javascript
const fs = require('fs');

// ==========================================
// 同步方法（Sync 后缀）- 阻塞式
// ==========================================

// 1. 检查文件/目录是否存在
fs.existsSync('/path/to/file');  // true / false

// 2. 创建目录
fs.mkdirSync('uploads/images', { recursive: true });
// recursive: true 表示递归创建，如果父目录不存在也会创建

// 3. 读取目录内容
const files = fs.readdirSync('uploads');
// ['photo1.jpg', 'photo2.jpg', 'document.pdf']

// 4. 读取文件
const content = fs.readFileSync('config.json', 'utf8');
const data = JSON.parse(content);

// 5. 写入文件
fs.writeFileSync('output.txt', 'Hello World');
fs.writeFileSync('data.json', JSON.stringify({ name: 'test' }));

// 6. 删除文件
fs.unlinkSync('/path/to/file');

// 7. 删除目录
fs.rmdirSync('empty-folder');
fs.rmSync('folder-with-files', { recursive: true });  // 删除非空目录

// 8. 获取文件信息
const stats = fs.statSync('/path/to/file');
stats.isFile();       // true
stats.isDirectory();  // false
stats.size;           // 文件大小（字节）
stats.mtime;          // 修改时间

// ==========================================
// 异步方法 - 非阻塞式（推荐在服务器中使用）
// ==========================================

// 回调方式
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Promise 方式（需要 fs/promises）
const fsPromises = require('fs/promises');

async function readConfig() {
  const content = await fsPromises.readFile('config.json', 'utf8');
  return JSON.parse(content);
}
```

#### 🎯 前端类比

```javascript
// 浏览器中没有 fs 模块，但概念类似：

// 1. 读取文件 - 使用 FileReader
const file = input.files[0];
const reader = new FileReader();
reader.onload = (e) => console.log(e.target.result);
reader.readAsText(file);

// 2. 下载/保存文件 - 使用 Blob
const blob = new Blob(['Hello'], { type: 'text/plain' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'file.txt';
a.click();

// 3. 获取文件信息 - File 对象
file.name;     // 文件名
file.size;     // 大小
file.type;     // MIME 类型
file.lastModified;  // 修改时间
```

---

### 2. MIME 类型详解

MIME（Multipurpose Internet Mail Extensions）类型用于标识文件的格式。

#### 常见 MIME 类型

| 类型 | MIME | 说明 |
|------|------|------|
| **图片** | | |
| JPEG | `image/jpeg` | 照片格式 |
| PNG | `image/png` | 支持透明 |
| GIF | `image/gif` | 动图 |
| WebP | `image/webp` | 现代格式 |
| SVG | `image/svg+xml` | 矢量图 |
| **文档** | | |
| PDF | `application/pdf` | PDF 文档 |
| Word | `application/msword` | .doc |
| Word (新) | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | .docx |
| Excel | `application/vnd.ms-excel` | .xls |
| Excel (新) | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | .xlsx |
| **视频** | | |
| MP4 | `video/mp4` | |
| WebM | `video/webm` | |
| **音频** | | |
| MP3 | `audio/mpeg` | |
| WAV | `audio/wav` | |
| **其他** | | |
| JSON | `application/json` | |
| ZIP | `application/zip` | |
| 二进制 | `application/octet-stream` | 未知类型 |

#### 判断 MIME 类型

```javascript
// 1. 通过 mimetype 属性
file.mimetype;  // 'image/jpeg'

// 2. 使用 startsWith 判断大类
file.mimetype.startsWith('image/');  // 是否是图片
file.mimetype.startsWith('video/');  // 是否是视频

// 3. 使用 includes 判断
file.mimetype.includes('pdf');       // 是否是 PDF
```

#### ⚠️ 安全提示

```javascript
// ❌ 不安全：只检查扩展名（用户可以伪造）
if (filename.endsWith('.jpg')) { ... }

// ✅ 安全：检查 MIME 类型（但也可被伪造）
if (file.mimetype === 'image/jpeg') { ... }

// ✅ 更安全：使用 magic number 检查文件头
// JPEG 文件开头是 FF D8 FF
// PNG 文件开头是 89 50 4E 47
```

---

### 3. multipart/form-data 格式原理

前端发送文件使用 **multipart/form-data** 格式，这是 HTTP 协议中专门用于传输文件的编码方式。

#### 3.1 为什么需要 multipart/form-data？

| 编码方式 | Content-Type | 适用场景 |
|---------|--------------|---------|
| URL 编码 | `application/x-www-form-urlencoded` | 普通表单数据 |
| JSON | `application/json` | API 数据交互 |
| **二进制** | **`multipart/form-data`** | **文件上传** |

#### 3.2 数据格式

```http
POST /api/upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="title"

我的照片
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="photo.jpg"
Content-Type: image/jpeg

[二进制文件内容]
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

- **boundary**：随机生成的分隔符，用于分隔多个字段
- 每个字段都有自己的 `Content-Disposition` 头
- 最后以 `--` 结尾表示结束

#### 3.3 前端发送

```javascript
// 前端代码
const formData = new FormData();
formData.append('title', '我的照片');
formData.append('file', fileInput.files[0]);

fetch('/api/upload', {
  method: 'POST',
  body: formData  // ⚠️ 不要手动设置 Content-Type！
});
```

**为什么不能设置 Content-Type？**

浏览器会自动设置 `Content-Type: multipart/form-data; boundary=----xxx`，其中 `boundary` 是用来分隔多个字段的随机字符串。手动设置会导致 boundary 丢失，服务器无法解析。

### 🎯 前端类比

```javascript
// axios 方式
const formData = new FormData();
formData.append('file', file);

axios.post('/upload', formData);
// axios 会自动设置正确的 Content-Type

// Element Plus Upload 组件
<el-upload action="/api/upload" :data="{ title: '我的照片' }">
  <el-button>点击上传</el-button>
</el-upload>
// 组件内部也是用 FormData 发送
```

---

### 4. Multer 库详解

**Multer** 是 Express 官方推荐的文件上传中间件，专门用于处理 `multipart/form-data` 格式的数据。

#### 4.1 安装

```bash
pnpm add multer
```

#### 4.2 基本用法

```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// 单文件上传
app.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.file);  // 上传的文件信息
  res.json({ file: req.file });
});
```

#### 4.3 配置选项

```javascript
const upload = multer({
  // 1. dest - 简单指定存储目录（文件名随机）
  dest: 'uploads/',
  
  // 2. storage - 自定义存储（见下文详解）
  storage: multer.diskStorage({ ... }),
  
  // 3. fileFilter - 文件过滤器
  fileFilter: (req, file, cb) => { ... },
  
  // 4. limits - 限制选项
  limits: {
    fileSize: 5 * 1024 * 1024,    // 单个文件最大 5MB
    files: 10,                     // 最多 10 个文件
    fields: 20,                    // 最多 20 个非文件字段
    fieldNameSize: 100,            // 字段名最长 100 字节
    fieldSize: 1024 * 1024,        // 单个字段值最大 1MB
  },
  
  // 5. preservePath - 保留文件的完整路径
  preservePath: false
});
```

#### 4.4 上传方式

```javascript
// 1. 单文件上传
upload.single('file')
// 使用：req.file 获取文件信息

// 2. 多文件上传（同一字段名）
upload.array('files', 5)  // 最多 5 个
// 使用：req.files 获取文件数组

// 3. 多字段上传（不同字段名）
upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'photos', maxCount: 5 }
])
// 使用：req.files.avatar[0], req.files.photos

// 4. 任意文件（不推荐）
upload.any()
// 使用：req.files

// 5. 只解析文本字段（不接受文件）
upload.none()
// 使用：req.body
```

#### 4.5 req.file 对象结构

上传成功后，文件信息会添加到 `req.file`（单文件）或 `req.files`（多文件）：

```javascript
{
  fieldname: 'file',           // 表单字段名
  originalname: '头像.jpg',     // 原始文件名
  encoding: '7bit',             // 编码方式
  mimetype: 'image/jpeg',       // MIME 类型
  destination: 'uploads/',      // 存储目录
  filename: 'abc123.jpg',       // 保存的文件名
  path: 'uploads/abc123.jpg',   // 完整路径
  size: 123456                  // 文件大小（字节）
}
```

#### 4.6 diskStorage 存储配置

使用 `multer.diskStorage()` 可以完全控制文件的存储位置和命名：

```javascript
const storage = multer.diskStorage({
  // destination - 存储目录
  destination: (req, file, cb) => {
    // req: Express 请求对象
    // file: 文件信息对象
    // cb: 回调函数 cb(error, destination)
    
    // 静态目录
    cb(null, 'uploads/');
    
    // 动态目录（根据用户）
    cb(null, `uploads/${req.user.id}/`);
    
    // 根据文件类型分目录
    let subDir = 'others';
    if (file.mimetype.startsWith('image/')) subDir = 'images';
    if (file.mimetype.startsWith('video/')) subDir = 'videos';
    cb(null, `uploads/${subDir}/`);
  },
  
  // filename - 文件命名
  filename: (req, file, cb) => {
    // 保持原始文件名（不推荐，可能冲突）
    cb(null, file.originalname);
    
    // 时间戳 + 随机数
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    
    // 使用 UUID（推荐）
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ storage });
```

#### 4.7 fileFilter 文件过滤

```javascript
const fileFilter = (req, file, cb) => {
  // 允许的图片类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);   // 接受文件
  } else {
    cb(new Error('只支持 JPG、PNG、GIF、WebP 格式'), false);  // 拒绝文件
  }
};

const upload = multer({ storage, fileFilter });
```

#### 4.8 memoryStorage 内存存储

如果需要直接处理文件内容（如上传到云存储），可以使用内存存储：

```javascript
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  // 文件内容在 req.file.buffer 中
  console.log(req.file.buffer);  // <Buffer ff d8 ff e0 ...>
  
  // 可以直接上传到 OSS/S3
  await s3.upload({
    Bucket: 'my-bucket',
    Key: 'photo.jpg',
    Body: req.file.buffer
  }).promise();
});
```

⚠️ **注意**：内存存储会将整个文件加载到内存，大文件可能导致内存溢出。

---

### 5. uuid 库简介

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

### 6. MulterError 错误类型详解

Multer 在遇到限制或配置问题时会抛出 `MulterError` 对象。

#### 6.1 错误类型列表

| 错误码 | 说明 | 触发条件 |
|-------|------|---------|
| `LIMIT_PART_COUNT` | 表单字段数量超限 | 字段总数超过 limits.parts |
| `LIMIT_FILE_SIZE` | 文件太大 | 单个文件超过 limits.fileSize |
| `LIMIT_FILE_COUNT` | 文件数量超限 | 文件数超过 limits.files 或 maxCount |
| `LIMIT_FIELD_KEY` | 字段名太长 | 字段名超过 limits.fieldNameSize |
| `LIMIT_FIELD_VALUE` | 字段值太大 | 非文件字段值超过 limits.fieldSize |
| `LIMIT_FIELD_COUNT` | 非文件字段数超限 | 非文件字段数超过 limits.fields |
| `LIMIT_UNEXPECTED_FILE` | 意外的文件字段 | 字段名与配置不匹配 |

#### 6.2 错误对象结构

```javascript
{
  name: 'MulterError',      // 错误名称
  code: 'LIMIT_FILE_SIZE',  // 错误码
  field: 'file',            // 出错的字段名
  message: 'File too large' // 错误消息
}
```

#### 6.3 完整的错误处理中间件

```javascript
const multer = require('multer');

const uploadErrorHandler = (err, req, res, next) => {
  // 处理 Multer 错误
  if (err instanceof multer.MulterError) {
    const errorMessages = {
      'LIMIT_PART_COUNT': '表单字段数量超出限制',
      'LIMIT_FILE_SIZE': '文件大小超出限制（最大 5MB）',
      'LIMIT_FILE_COUNT': '文件数量超出限制',
      'LIMIT_FIELD_KEY': '字段名过长',
      'LIMIT_FIELD_VALUE': '字段值过大',
      'LIMIT_FIELD_COUNT': '表单字段数量超出限制',
      'LIMIT_UNEXPECTED_FILE': `不允许的文件字段: ${err.field}`
    };
    
    return res.status(400).json({
      error: '上传失败',
      code: err.code,
      message: errorMessages[err.code] || err.message,
      field: err.field
    });
  }
  
  // 处理自定义错误（如 fileFilter 抛出的错误）
  if (err) {
    return res.status(400).json({
      error: '上传失败',
      message: err.message
    });
  }
  
  next();
};

// 使用方式
app.post('/api/upload',
  upload.single('file'),
  uploadErrorHandler,
  controller.upload
);
```

#### 6.4 前端配合处理

```javascript
// 前端代码
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // 处理上传错误
      switch (data.code) {
        case 'LIMIT_FILE_SIZE':
          alert('文件太大，请选择小于 5MB 的文件');
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          alert('请使用正确的文件字段名');
          break;
        default:
          alert(data.message || '上传失败');
      }
      return null;
    }
    
    return data;
  } catch (error) {
    alert('网络错误');
    return null;
  }
}
```

---

### 7. 静态文件服务

上传的文件需要能被前端访问，这需要使用 Express 的静态文件服务。

#### 7.1 基本用法

```javascript
const express = require('express');
const path = require('path');

// 将 uploads 目录映射到 /uploads 路径
app.use('/uploads', express.static('uploads'));

// 访问方式：http://localhost:3000/uploads/xxx.jpg
```

#### 7.2 express.static() 详解

```javascript
express.static(root, [options])
```

**参数说明：**

| 参数 | 说明 |
|-----|------|
| `root` | 静态文件的根目录 |
| `options.dotfiles` | 如何处理以 `.` 开头的文件：`'ignore'`（默认）、`'allow'`、`'deny'` |
| `options.extensions` | 尝试的文件扩展名：`['html', 'htm']` |
| `options.index` | 目录的索引文件：`'index.html'`（默认）或 `false` |
| `options.maxAge` | 缓存时间（毫秒）：`0`（默认） |
| `options.redirect` | 目录 URL 末尾是否加 `/`：`true`（默认） |

**常用配置：**

```javascript
// 生产环境配置
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',           // 缓存 1 天
  etag: true,             // 启用 ETag
  lastModified: true,     // 启用 Last-Modified
  dotfiles: 'ignore',     // 忽略 .xxx 文件
  index: false            // 禁止目录列表
}));
```

#### 7.3 多个静态目录

```javascript
// 可以设置多个静态目录
app.use(express.static('public'));          // /xxx → public/xxx
app.use('/uploads', express.static('uploads'));  // /uploads/xxx → uploads/xxx
app.use('/cdn', express.static('/var/cdn'));     // /cdn/xxx → /var/cdn/xxx
```

#### 7.4 使用绝对路径

```javascript
// 推荐使用绝对路径，避免工作目录问题
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

### 🎯 前端类比

这类似于 Vite 的 `public` 目录：

```
public/
└── images/
    └── logo.png  → 访问 /images/logo.png
```

```javascript
// Vite 配置
export default defineConfig({
  publicDir: 'public',  // 默认就是 public
  base: '/'             // 基础路径
});
```

---

### 8. 安全注意事项

文件上传是 Web 应用中最容易出现安全漏洞的功能之一，需要特别注意。

#### 8.1 验证文件类型

```javascript
// ❌ 不安全：只检查扩展名（用户可以伪造）
if (file.originalname.endsWith('.jpg')) { ... }

// ⚠️ 较安全：检查 MIME 类型（也可被伪造）
if (file.mimetype === 'image/jpeg') { ... }

// ✅ 更安全：检查文件头（magic number）
const fileType = require('file-type');

const validateFileType = async (req, res, next) => {
  if (!req.file) return next();
  
  const buffer = await fs.promises.readFile(req.file.path);
  const type = await fileType.fromBuffer(buffer);
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (!type || !allowedTypes.includes(type.mime)) {
    fs.unlinkSync(req.file.path);  // 删除非法文件
    return res.status(400).json({ error: '非法的文件类型' });
  }
  
  next();
};
```

#### 8.2 限制文件大小

```javascript
// multer 配置
limits: { 
  fileSize: 5 * 1024 * 1024,  // 单个文件最大 5MB
  files: 10                    // 最多 10 个文件
}

// Nginx 也需要配置（生产环境）
// client_max_body_size 10m;
```

#### 8.3 使用随机文件名

```javascript
// ❌ 危险：使用原始文件名
filename: file.originalname
// 用户可能上传 ../../../etc/passwd 来进行路径遍历攻击

// ✅ 安全：使用 UUID 重命名
const { v4: uuidv4 } = require('uuid');
filename: `${uuidv4()}${path.extname(file.originalname)}`
```

#### 8.4 上传目录安全

```javascript
// ❌ 不推荐：放在代码目录下
const uploadDir = './src/uploads';

// ✅ 推荐：独立的存储目录
const uploadDir = '/var/uploads';  // Linux
const uploadDir = 'D:\\uploads';    // Windows

// 确保上传目录不能执行脚本
// Nginx 配置：
// location /uploads {
//   location ~ \.(php|jsp|asp)$ { deny all; }
// }
```

#### 8.5 病毒扫描（生产环境）

```javascript
// 使用 ClamAV 扫描上传的文件
const NodeClam = require('clamscan');

const clamscan = await new NodeClam().init({
  clamdscan: { socket: '/var/run/clamav/clamd.sock' }
});

const scanFile = async (req, res, next) => {
  if (!req.file) return next();
  
  const { is_infected } = await clamscan.is_infected(req.file.path);
  
  if (is_infected) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: '文件被检测到病毒' });
  }
  
  next();
};
```

#### 8.6 速率限制

```javascript
const rateLimit = require('express-rate-limit');

// 限制上传频率
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 分钟
  max: 10,                    // 最多 10 次上传
  message: { error: '上传太频繁，请稍后再试' }
});

app.use('/api/upload', uploadLimiter);
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

### 核心知识点

| 知识点 | 说明 |
|-------|------|
| **path 模块** | Node.js 内置的路径处理模块 |
| **fs 模块** | Node.js 内置的文件系统操作模块 |
| **MIME 类型** | 用于标识文件格式的标准 |
| **multipart/form-data** | HTTP 文件上传的编码格式 |
| **multer** | Express 文件上传中间件 |
| **uuid** | 生成唯一标识符的库 |
| **diskStorage** | multer 的磁盘存储配置 |
| **fileFilter** | multer 的文件过滤器 |
| **limits** | multer 的限制配置 |
| **MulterError** | multer 的错误类型 |
| **express.static** | Express 静态文件服务 |

### 重要原则

1. **前端验证是 UX，后端验证是安全** - 前端的文件类型限制可以被绕过
2. **使用 UUID 命名文件** - 避免文件名冲突和路径遍历攻击
3. **检查 MIME 类型** - 比检查扩展名更安全
4. **限制文件大小** - 防止服务器被大文件攻击
5. **独立存储目录** - 上传文件不要放在代码目录下

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
