"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../common/middleware/auth");
const support_controller_1 = require("./support.controller");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// GET /api/support/tickets - Get user support tickets
router.get('/tickets', support_controller_1.getUserTickets);
// GET /api/support/tickets/:id - Get single support ticket
router.get('/tickets/:id', support_controller_1.getTicketById);
// POST /api/support/tickets - Create new support ticket
router.post('/tickets', support_controller_1.createTicket);
// PUT /api/support/tickets/:id - Update support ticket
router.put('/tickets/:id', support_controller_1.updateTicket);
exports.default = router;
