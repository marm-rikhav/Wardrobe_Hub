import returnRequestService from "../services/returnRequest.service.js";

/**
 * Customer: Create return or exchange request
 */
export const createReturnRequest = async (req, res, next) => {
  try {
    const request = await returnRequestService.createReturnRequest(
      req.user.id,
      req.params.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: `${request.type === "RETURN" ? "Return" : "Exchange"} request submitted successfully`,
      data: { request },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Customer: Get return/exchange request status for an order
 */
export const getReturnRequestByOrderId = async (req, res, next) => {
  try {
    const request = await returnRequestService.getReturnRequestByOrderId(
      req.user.id,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Return request fetched successfully",
      data: { request },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Get all return/exchange requests with filters & pagination
 */
export const getAllReturnRequestsAdmin = async (req, res, next) => {
  try {
    const { requests, pagination } = await returnRequestService.getAllReturnRequestsAdmin(req.query);

    return res.status(200).json({
      success: true,
      message: "Return requests fetched successfully",
      data: { requests, pagination },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Get single return/exchange request by ID
 */
export const getReturnRequestByIdAdmin = async (req, res, next) => {
  try {
    const request = await returnRequestService.getReturnRequestByIdAdmin(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Return request details fetched successfully",
      data: { request },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Approve or reject return/exchange request
 */
export const updateReturnRequestStatusAdmin = async (req, res, next) => {
  try {
    const request = await returnRequestService.updateReturnRequestStatusAdmin(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: `Return request ${request.status.toLowerCase()} successfully`,
      data: { request },
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  createReturnRequest,
  getReturnRequestByOrderId,
  getAllReturnRequestsAdmin,
  getReturnRequestByIdAdmin,
  updateReturnRequestStatusAdmin,
};
