const { body, param, validationResult } = require('express-validator');
const { AppError } = require('./error.middleware');

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => `${err.param}: ${err.msg}`).join(', ');
        throw new AppError(errorMessages, 400, 'VALIDATION_ERROR');
    }
    next();
};

// Validation rules for auth
const authValidation = {
    register: [
        body('email')
            .isEmail()
            .withMessage('Must be a valid email address')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required')
            .isLength({ min: 2, max: 100 })
            .withMessage('Name must be between 2 and 100 characters'),
        validate
    ],
    login: [
        body('email')
            .isEmail()
            .withMessage('Must be a valid email address')
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .withMessage('Password is required'),
        validate
    ],
    updateProfile: [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Name must be between 2 and 100 characters'),
        validate
    ],
    updatePassword: [
        body('currentPassword')
            .notEmpty()
            .withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('New password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
        validate
    ]
};

// Validation rules for forms
const formValidation = {
    create: [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Form title is required')
            .isLength({ max: 200 })
            .withMessage('Title must be less than 200 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Description must be less than 1000 characters'),
        body('questions')
            .optional()
            .isArray()
            .withMessage('Questions must be an array'),
        validate
    ],
    update: [
        param('id')
            .isUUID()
            .withMessage('Invalid form ID'),
        body('title')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('Form title cannot be empty')
            .isLength({ max: 200 })
            .withMessage('Title must be less than 200 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Description must be less than 1000 characters'),
        body('isPublic')
            .optional()
            .isBoolean()
            .withMessage('isPublic must be a boolean')
            .toBoolean(),
        validate
    ],
    delete: [
        param('id')
            .isUUID()
            .withMessage('Invalid form ID'),
        validate
    ],
    getOne: [
        param('id')
            .isUUID()
            .withMessage('Invalid form ID'),
        validate
    ]
};

// Validation rules for questions
const questionValidation = {
    create: [
        body('formId')
            .isUUID()
            .withMessage('Invalid form ID'),
        body('type')
            .isIn(['TEXT', 'MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN', 'DATE'])
            .withMessage('Invalid question type'),
        body('label')
            .trim()
            .notEmpty()
            .withMessage('Question label is required')
            .isLength({ max: 500 })
            .withMessage('Label must be less than 500 characters'),
        body('required')
            .optional()
            .isBoolean()
            .withMessage('Required must be a boolean'),
        validate
    ]
};

// Validation rules for responses
const responseValidation = {
    submit: [
        param('formId')
            .isUUID()
            .withMessage('Invalid form ID'),
        body('answers')
            .isObject()
            .withMessage('Answers must be an object'),
        validate
    ],
    list: [
        param('formId')
            .isUUID()
            .withMessage('Invalid form ID'),
        validate
    ],
    delete: [
        param('id')
            .isUUID()
            .withMessage('Invalid response ID'),
        validate
    ]
};

module.exports = {
    authValidation,
    formValidation,
    questionValidation,
    responseValidation,
    validate
};
