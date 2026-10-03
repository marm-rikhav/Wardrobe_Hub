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

/**
 * Admin: Get customer by ID with full details, addresses, and 5 recent orders
 */
export const getCustomerByIdAdmin = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerByIdAdmin(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Customer details fetched successfully",
      data: { customer },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Update customer details
 */
export const updateCustomerAdmin = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomerAdmin(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: { customer },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Toggle customer active status
 */
export const toggleCustomerStatusAdmin = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const customer = await customerService.toggleCustomerStatusAdmin(req.params.id, isActive);
    return res.status(200).json({
      success: true,
      message: `Customer ${isActive ? "activated" : "deactivated"} successfully`,
      data: { customer },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Permanently delete customer
 */
export const deleteCustomerAdmin = async (req, res, next) => {
  try {
    await customerService.deleteCustomerAdmin(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Update customer address
 */
export const updateCustomerAddressAdmin = async (req, res, next) => {
  try {
    const { id, addressId } = req.params;
    const address = await customerService.updateCustomerAddressAdmin(id, addressId, req.body);
    return res.status(200).json({
      success: true,
      message: "Customer address updated successfully",
      data: { address },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Create a new customer (initialized as deactivated)
 */
export const createCustomerAdmin = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomerAdmin(req.body);
    return res.status(201).json({
      success: true,
      message: "Customer created successfully (deactivated on creation)",
      data: { customer },
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getAllCustomersAdmin,
  getCustomerByIdAdmin,
  updateCustomerAdmin,
  toggleCustomerStatusAdmin,
  deleteCustomerAdmin,
  updateCustomerAddressAdmin,
  createCustomerAdmin,
};
