require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');

/**
 * CLI script to safely bootstrap an Administrator account
 * Usage: node backend/scripts/createAdmin.js <email> <password> <name>
 * Or reads ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME from environment
 */
async function createAdmin() {
  const args = process.argv.slice(2);
  const email = (args[0] || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = args[1] || process.env.ADMIN_PASSWORD;
  const name = args[2] || process.env.ADMIN_NAME || 'System Administrator';

  if (!email || !password) {
    console.error('Error: Please provide both email and password.');
    console.error('Usage: node backend/scripts/createAdmin.js <email> <password> [name]');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('Error: Password must be at least 6 characters long.');
    process.exit(1);
  }

  try {
    await connectDB();

    let user = await User.findOne({ email });
    if (user) {
      user.role = 'admin';
      user.password = password; // Will be hashed by pre-save hook
      if (name) user.name = name;
      await user.save();
      console.log(`[Admin Bootstrap] Existing user '${email}' has been promoted to Administrator.`);
    } else {
      user = new User({
        name,
        email,
        password,
        role: 'admin'
      });
      await user.save();
      console.log(`[Admin Bootstrap] Successfully created new Administrator: '${email}'.`);
    }
  } catch (err) {
    console.error('[Admin Bootstrap] Failed:', err.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

createAdmin();
