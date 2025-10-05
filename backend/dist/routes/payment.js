"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const packages_1 = require("../config/packages");
const router = express_1.default.Router();
router.get('/packages', (req, res) => {
    res.json({ success: true, packages: packages_1.CREDIT_PACKAGES });
});
router.post('/create-checkout-session', auth_1.authenticate, async (req, res) => {
    try {
        const { packageType = 'starter' } = req.body;
        const pkg = packages_1.CREDIT_PACKAGES[packageType];
        if (!pkg) {
            return res.status(400).json({ success: false, message: 'Package not found' });
        }
        res.json({
            success: true,
            url: `https://checkout.stripe.com/pay/test_${packageType}`,
            package: pkg
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating session'
        });
    }
});
exports.default = router;
