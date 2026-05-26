"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../common/middleware/auth");
const addresses_controller_1 = require("./addresses.controller");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// GET /api/addresses - Get all user addresses
router.get('/', addresses_controller_1.getUserAddresses);
// POST /api/addresses - Add new address
router.post('/', addresses_controller_1.addAddress);
// PUT /api/addresses/:id - Update address
router.put('/:id', addresses_controller_1.updateAddress);
// DELETE /api/addresses/:id - Delete address
router.delete('/:id', addresses_controller_1.deleteAddress);
// PATCH /api/addresses/:id/default - Set default address
router.patch('/:id/default', addresses_controller_1.setDefaultAddress);
exports.default = router;
