/**
 * 文件上传配置
 * 
 * 使用 multer 库处理文件上传
 * 
 * multer 是 Express 官方推荐的文件上传中间件
 * 它处理 multipart/form-data 格式的数据
 */

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 上传目录
const UPLOAD_DIR = path.join(__dirname, '../uploads');

/**
 * 存储配置
 */
const storage = multer.diskStorage({
  // 文件存储目录
  destination: (req, file, cb) => {
    // 根据文件类型分目录存储
    let subDir = 'others';
    if (file.mimetype.startsWith('image/')) {
      subDir = 'images';
    } else if (file.mimetype.startsWith('video/')) {
      subDir = 'videos';
    } else if (file.mimetype.includes('pdf') || file.mimetype.includes('document')) {
      subDir = 'documents';
    }
    
    cb(null, path.join(UPLOAD_DIR, subDir));
  },
  
  // 文件命名
  filename: (req, file, cb) => {
    // 获取原始扩展名
    const ext = path.extname(file.originalname);
    // 生成唯一文件名：uuid + 扩展名
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

/**
 * 文件过滤器
 */
const fileFilter = (req, file, cb) => {
  // 允许的图片类型
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  // 允许的文档类型
  const allowedDocTypes = ['application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  const allowedTypes = [...allowedImageTypes, ...allowedDocTypes];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}`), false);
  }
};

/**
 * 创建上传中间件
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 最大 5MB
    files: 5                     // 最多 5 个文件
  }
});

// 单文件上传
const singleUpload = upload.single('file');

// 多文件上传
const multipleUpload = upload.array('files', 5);

// 多字段上传
const fieldsUpload = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'photos', maxCount: 5 }
]);

module.exports = {
  upload,
  singleUpload,
  multipleUpload,
  fieldsUpload,
  UPLOAD_DIR
};

