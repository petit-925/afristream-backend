"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../common/middleware/auth");
const sessions_controller_1 = require("./sessions.controller");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// GET /api/sessions - Get user sessions
router.get('/', sessions_controller_1.getUserSessions);
// DELETE /api/sessions/:id - Log out from specific session
router.delete('/:id', sessions_controller_1.logoutSession);
// DELETE /api/sessions - Log out from all other sessions
router.delete('/', sessions_controller_1.logoutAllOtherSessions);
// POST /api/sessions/2fa/toggle - Toggle Two-Factor Authentication
router.post('/2fa/toggle', sessions_controller_1.toggleTwoFactor);
exports.default = router;
