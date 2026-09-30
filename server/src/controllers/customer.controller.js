import customerService from "../services/customer.service.js";

/**
 * Admin: Get all customers with search and pagination
 */
export const getAllCustomersAdmin = async (req, res, next) => {
  try {
    const { customers, pagination } = await customerService.getAllCustomersAdmin(req.query);
    return res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      data: { customers, pagination },
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getAllCustomersAdmin,
};
