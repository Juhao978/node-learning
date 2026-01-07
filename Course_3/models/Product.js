/**
 * Product 模型 - MVC 中的 Model 层
 */

let products = [
  { id: 1, name: 'iPhone 15', price: 7999, stock: 100, category: '手机' },
  { id: 2, name: 'MacBook Pro', price: 14999, stock: 50, category: '电脑' },
  { id: 3, name: 'AirPods Pro', price: 1899, stock: 200, category: '配件' }
];

let nextId = 4;

const findAll = () => products;

const findById = (id) => products.find(p => p.id === id);

const create = (data) => {
  const newProduct = { id: nextId++, ...data };
  products.push(newProduct);
  return newProduct;
};

const update = (id, data) => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...data };
  return products[index];
};

const remove = (id) => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
};

module.exports = { findAll, findById, create, update, remove };

