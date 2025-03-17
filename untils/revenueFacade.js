const RevenueService = require('../untils/revenueService');

class RevenueFacade {
  async getTotalRevenue() {
    return await RevenueService.getTotalRevenue();
  }

  async getCountDashboard() {
    return await RevenueService.getCountDashboard();
  }
}

module.exports = new RevenueFacade();