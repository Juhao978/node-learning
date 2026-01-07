module.exports = {
  secret: process.env.JWT_SECRET || 'blog-api-secret-key',
  accessTokenExpiry: '7d'
};

