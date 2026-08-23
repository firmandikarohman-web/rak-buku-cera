const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const cartController = require('../controllers/cartController');

// Books Routes
router.get('/books', bookController.getBooks);
router.get('/books/:id', bookController.getBookById);
router.post('/books', bookController.createBook);

// Cart Routes
router.get('/cart', cartController.getCart);
router.post('/cart/add', cartController.addToCart);
router.delete('/cart/remove/:id', cartController.removeFromCart);

module.exports = router;
