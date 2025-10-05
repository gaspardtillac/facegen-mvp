"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../utils/jwt");
class AuthController {
    async register(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email et mot de passe requis'
                });
            }
            const existingUser = await database_1.default.user.findUnique({
                where: { email: email.toLowerCase() }
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Un compte avec cet email existe déjà'
                });
            }
            const saltRounds = 12;
            const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
            const user = await database_1.default.user.create({
                data: {
                    email: email.toLowerCase(),
                    passwordHash,
                    credits: parseInt(process.env.INITIAL_CREDITS || '5')
                },
                select: {
                    id: true,
                    email: true,
                    credits: true
                }
            });
            const token = (0, jwt_1.generateToken)({
                userId: user.id,
                email: user.email
            });
            res.status(201).json({
                success: true,
                user,
                token,
                message: 'Compte créé avec succès'
            });
        }
        catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email et mot de passe requis'
                });
            }
            const user = await database_1.default.user.findUnique({
                where: { email: email.toLowerCase() }
            });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou mot de passe incorrect'
                });
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou mot de passe incorrect'
                });
            }
            const token = (0, jwt_1.generateToken)({
                userId: user.id,
                email: user.email
            });
            res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    credits: user.credits
                },
                token,
                message: 'Connexion réussie'
            });
        }
        catch (error) {
            console.error('Erreur lors de la connexion:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
    async getProfile(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Non authentifié'
                });
            }
            const user = await database_1.default.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    email: true,
                    credits: true,
                    createdAt: true
                }
            });
            res.json({
                success: true,
                user
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
