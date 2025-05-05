import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send verification email
export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  
  const mailOptions = {
    from: `"Domus" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify your email address',
    html: `
      <h1>Welcome to Domus!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
  const mailOptions = {
    from: `"Domus" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset your password',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send maintenance notification
export const sendMaintenanceNotification = async (email, maintenance) => {
  const mailOptions = {
    from: `"Domus" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'New Maintenance Request',
    html: `
      <h1>New Maintenance Request</h1>
      <p>A new maintenance request has been submitted:</p>
      <ul>
        <li>Title: ${maintenance.title}</li>
        <li>Description: ${maintenance.description}</li>
        <li>Priority: ${maintenance.priority}</li>
        <li>Status: ${maintenance.status}</li>
      </ul>
      <p>Please log in to your account to view more details and take action.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending maintenance notification:', error);
    throw new Error('Failed to send maintenance notification');
  }
};

// Send rent payment reminder
export const sendRentReminder = async (email, property, dueDate) => {
  const mailOptions = {
    from: `"Domus" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Rent Payment Reminder',
    html: `
      <h1>Rent Payment Reminder</h1>
      <p>This is a reminder that your rent payment for ${property.title} is due on ${dueDate}.</p>
      <p>Amount due: ${property.price.amount} ${property.price.currency}</p>
      <p>Please ensure your payment is made on time to avoid any late fees.</p>
      <p>You can make your payment through the Domus platform.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending rent reminder:', error);
    throw new Error('Failed to send rent reminder');
  }
}; 