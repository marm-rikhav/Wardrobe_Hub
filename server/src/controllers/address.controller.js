import addressService from "../services/address.service.js";

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await addressService.getUserAddresses(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: { addresses },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAddressById = async (req, res, next) => {
  try {
    const address = await addressService.getAddressById(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      data: { address },
    });
  } catch (error) {
    return next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const address = await addressService.createAddress(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: { address },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const address = await addressService.updateAddress(
      req.user.id,
      req.params.id,
      req.body
    );
    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: { address },
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const result = await addressService.deleteAddress(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await addressService.setDefaultAddress(
      req.user.id,
      req.params.id
    );
    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: { address },
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
