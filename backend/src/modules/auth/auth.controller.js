const authService = require("./auth.service");

const register = async (req, res, next) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const result = await authService.loginUser(req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

const getMe = async (req, res, next) => {
    try {
        const user = await authService.getUserById(req.user.userId);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const user = await authService.updateProfile(req.user.userId, req.body);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

const updatePassword = async (req, res, next) => {
    try {
        await authService.updatePassword(req.user.userId, req.body.currentPassword, req.body.newPassword);
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, getMe, updateProfile, updatePassword };