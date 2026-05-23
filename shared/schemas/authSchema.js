const { z } = require('zod');

// Base auth schema for initial login attempt
const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Schema for when a user doesn't exist and needs to be created
const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters')
});

module.exports = {
  loginSchema,
  signupSchema
};
