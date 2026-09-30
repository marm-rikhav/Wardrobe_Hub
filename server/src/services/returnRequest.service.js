import prisma from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";
import {
  sendReturnRequestSubmittedEmail,
  sendReturnRequestStatusUpdatedEmail,
} from "./email.service.js";


/**
 * Format a ReturnRequest record for client/admin consumption without exposing customer ID.
 */
export const formatReturnRequest = (req) => {
  if (!req) return null;

  return {
    id: req.id,
    orderId: req.orderId,
    orderNumber: req.order?.orderNumber || null,
    customerName: req.user?.name || req.order?.shipName || null,
    customerEmail: req.user?.email || null,
    customerPhone: req.user?.phone || null,
    type: req.type,
    reason: req.reason,
    details: req.details || null,
    status: req.status,
    adminResponse: req.adminResponse || null,
    createdAt: req.createdAt,
    updatedAt: req.updatedAt,
    order: req.order || null,
  };
};

/**
 * Customer: Create a return or exchange request for a delivered order.
 */
export const createReturnRequest = async (userId, orderId, { type, reason, details }) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Verify customer owns the order
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new ApiError(404, "Order not found or you do not have permission to view it");
    }

    // 2. Enforce delivery requirement
    if (order.status !== "DELIVERED") {
      throw new ApiError(
        400,
        `Return or exchange requests can only be created for DELIVERED orders. Current order status is "${order.status}".`
      );
    }

    // 3. Prevent duplicate active requests (PENDING or APPROVED)
    const existingActiveRequest = await tx.returnRequest.findFirst({
      where: {
        orderId,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (existingActiveRequest) {
      throw new ApiError(
        409,
        `An active ${existingActiveRequest.type.toLowerCase()} request already exists for this order with status "${existingActiveRequest.status}".`
      );
    }

    // 4. Create new request
    const created = await tx.returnRequest.create({
      data: {
        orderId,
        userId,
        type,
        reason: reason.trim(),
        details: details ? details.trim() : null,
        status: "PENDING",
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            shipName: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    const formatted = formatReturnRequest(created);
    sendReturnRequestSubmittedEmail(formatted, created.order, created.user?.email).catch((err) => {
      console.error("[EmailService] Error dispatching return request submitted email:", err?.message || err);
    });

    return formatted;
  });
};


/**
 * Customer: Get return/exchange request status for an order.
 */
export const getReturnRequestByOrderId = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
  });

  if (!order) {
    throw new ApiError(404, "Order not found or you do not have permission to view it");
  }

  const request = await prisma.returnRequest.findFirst({
    where: { orderId, userId },
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          shipName: true,
          createdAt: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return formatReturnRequest(request);
};

/**
 * Admin: List all return/exchange requests with filtering & pagination.
 */
export const getAllReturnRequestsAdmin = async ({ status, type, page, limit }) => {
  const where = {};

  if (status && status !== "ALL") {
    where.status = status.toUpperCase();
  }

  if (type && type !== "ALL") {
    where.type = type.toUpperCase();
  }

  const numericPage = page ? Number(page) : undefined;
  const numericLimit = limit ? Number(limit) : undefined;
  const skip = numericPage && numericLimit ? (numericPage - 1) * numericLimit : undefined;
  const take = numericLimit;

  const [total, requests] = await Promise.all([
    prisma.returnRequest.count({ where }),
    prisma.returnRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            shipName: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    }),
  ]);

  return {
    requests: requests.map(formatReturnRequest),
    pagination: {
      total,
      page: numericPage || 1,
      limit: numericLimit || total,
      totalPages: numericLimit ? Math.ceil(total / numericLimit) : 1,
    },
  };
};

/**
 * Admin: Get single return/exchange request details by ID.
 */
export const getReturnRequestByIdAdmin = async (id) => {
  const request = await prisma.returnRequest.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: {
                        orderBy: { sortOrder: "asc" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!request) {
    throw new ApiError(404, "Return request not found");
  }

  return formatReturnRequest(request);
};

/**
 * Admin: Approve or reject return/exchange request.
 */
export const updateReturnRequestStatusAdmin = async (id, { status, adminResponse }) => {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.returnRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, "Return request not found");
    }

    if (existing.status !== "PENDING") {
      throw new ApiError(
        400,
        `Cannot update request that is already ${existing.status}. Only PENDING requests can be approved or rejected.`
      );
    }

    const updated = await tx.returnRequest.update({
      where: { id },
      data: {
        status,
        adminResponse: adminResponse ? adminResponse.trim() : null,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            shipName: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    const formatted = formatReturnRequest(updated);
    sendReturnRequestStatusUpdatedEmail(formatted, updated.order, updated.user?.email).catch((err) => {
      console.error("[EmailService] Error dispatching return request status email:", err?.message || err);
    });

    return formatReturnRequest(updated);
  });
};


export default {
  formatReturnRequest,
  createReturnRequest,
  getReturnRequestByOrderId,
  getAllReturnRequestsAdmin,
  getReturnRequestByIdAdmin,
  updateReturnRequestStatusAdmin,
};
