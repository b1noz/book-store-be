const RevenueFacade = require('../untils/revenueFacade');

exports.getTotalRevenue = async (req, res) => {
  try {
    const { totalRevenue, totalRecords, orders } = await RevenueFacade.getTotalRevenue();
    res.status(200).json({
      status: 'success',
      totalRevenue,
      totalRecords,
      orders,
    });
  } catch (err) {
    res.status(500).json({ status: 'failed', message: err.message });
  }
};

exports.getCountDashboard = async (req, res, next) => {
  try {
    const { countUser, countProduct, countOrder } = await RevenueFacade.getCountDashboard();
    res.json({ countUser, countProduct, countOrder });
  } catch (err) {
    res.json({ err: err.message });
  }
};