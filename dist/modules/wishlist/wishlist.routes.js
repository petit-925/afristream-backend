"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../common/middleware/auth");
const wishlist_controller_1 = require("./wishlist.controller");
const router = (0, express_1.Router)();
// Public shared list access
router.get('/shared/:token', wishlist_controller_1.getSharedWishlist);
// All routes below require authentication
router.use(auth_1.authenticate);
// GET /api/wishlist - Get user wishlist (grouped by lists)
router.get('/', wishlist_controller_1.getUserWishlist);
// POST /api/wishlist - Add item to wishlist (optional listName)
router.post('/', wishlist_controller_1.addToWishlist);
// PATCH /api/wishlist/list - Rename list
router.patch('/list', wishlist_controller_1.renameWishlistList);
// POST /api/wishlist/list/share - Enable/disable sharing for a list
router.post('/list/share', wishlist_controller_1.toggleWishlistShare);
// DELETE /api/wishlist/:id - Remove item from wishlist
router.delete('/:id', wishlist_controller_1.removeFromWishlist);
// DELETE /api/wishlist - Clear entire wishlist
router.delete('/', wishlist_controller_1.clearWishlist);
exports.default = router;
