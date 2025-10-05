"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.PaymentController = void 0;
class PaymentController {
    async createCheckoutSession(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Not authenticated' });
            }
            res.json({ success: true });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
}
exports.PaymentController = PaymentController;
exports.paymentController = new PaymentController();
