import dashboardService from "../services/dashboard.service.js";

/**
 * Admin: Get dashboard stats (total orders, total revenue, low stock, recent orders)
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    return res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully",
      data: stats,
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getDashboardStats,
};
