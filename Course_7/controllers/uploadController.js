/**
 * 上传控制器
 */

const path = require('path');
const fs = require('fs');
const { UPLOAD_DIR } = require('../config/upload');

/**
 * 单文件上传
 * POST /api/upload
 */
const uploadSingle = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择文件' });
  }
  
  const file = req.file;
  
  res.json({
    message: '上传成功',
    file: {
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`
    }
  });
};

/**
 * 多文件上传
 * POST /api/upload/multiple
 */
const uploadMultiple = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: '请选择文件' });
  }
  
  const files = req.files.map(file => ({
    originalName: file.originalname,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`
  }));
  
  res.json({
    message: `成功上传 ${files.length} 个文件`,
    files
  });
};

/**
 * 多字段上传
 * POST /api/upload/fields
 */
const uploadFields = (req, res) => {
  const result = {};
  
  if (req.files.avatar && req.files.avatar[0]) {
    const avatar = req.files.avatar[0];
    result.avatar = {
      filename: avatar.filename,
      url: `/uploads/images/${avatar.filename}`
    };
  }
  
  if (req.files.photos) {
    result.photos = req.files.photos.map(photo => ({
      filename: photo.filename,
      url: `/uploads/images/${photo.filename}`
    }));
  }
  
  res.json({
    message: '上传成功',
    ...result
  });
};

/**
 * 获取文件列表
 * GET /api/files
 */
const getFiles = (req, res) => {
  const { type = 'images' } = req.query;
  const dir = path.join(UPLOAD_DIR, type);
  
  if (!fs.existsSync(dir)) {
    return res.json({ files: [] });
  }
  
  const files = fs.readdirSync(dir).map(filename => ({
    filename,
    url: `/uploads/${type}/${filename}`,
    path: path.join(dir, filename)
  }));
  
  res.json({ files });
};

/**
 * 删除文件
 * DELETE /api/files/:type/:filename
 */
const deleteFile = (req, res) => {
  const { type, filename } = req.params;
  const filePath = path.join(UPLOAD_DIR, type, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: '文件不存在' });
  }
  
  fs.unlinkSync(filePath);
  res.json({ message: '删除成功' });
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  getFiles,
  deleteFile
};

