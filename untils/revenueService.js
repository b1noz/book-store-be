const Revenue = require('../models/revenue');
const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/orders');

class RevenueService {
  async getTotalRevenue() {
    const allRevenues = await Revenue.find({});
    const totalRevenue = allRevenues.reduce((total, record) => total + record.totalAmount, 0);
    return { totalRevenue, totalRecords: allRevenues.length, orders: allRevenues };
  }

  async getCountDashboard() {
    const countUser = await User.countDocuments({});
    const countProduct = await Product.countDocuments({});
    const countOrder = await Order.countDocuments({});
    return { countUser, countProduct, countOrder };
  }
}

module.exports = new RevenueService();