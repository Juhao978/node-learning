/**
 * Product 控制器
 */

const Product = require('../models/Product');

const getProducts = (req, res) => {
  const products = Product.findAll();
  res.json({ total: products.length, data: products });
};

const getProductById = (req, res) => {
  const product = Product.findById(parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: '产品不存在' });
  res.json(product);
};

const createProduct = (req, res) => {
  const { name, price, stock, category } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: '缺少必填字段: name, price' });
  }
  const newProduct = Product.create({ name, price, stock: stock || 0, category });
  res.status(201).json(newProduct);
};

const updateProduct = (req, res) => {
  const updated = Product.update(parseInt(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: '产品不存在' });
  res.json(updated);
};

const deleteProduct = (req, res) => {
  const success = Product.remove(parseInt(req.params.id));
  if (!success) return res.status(404).json({ error: '产品不存在' });
  res.sendStatus(204);
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

