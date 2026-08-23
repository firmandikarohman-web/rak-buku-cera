// Placeholder for Cart Controller
exports.getCart = (req, res) => {
    res.json({ message: "Current user cart" });
};

exports.addToCart = (req, res) => {
    res.json({ message: "Item added to cart" });
};

exports.removeFromCart = (req, res) => {
    res.json({ message: "Item removed from cart" });
};
