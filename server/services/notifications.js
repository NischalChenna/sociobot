import nodemailer from "nodemailer";

let transporter;

export const initializeNotifications = () => {
  // transporter = nodemailer.createTransporter({
  //   host: process.env.SMTP_HOST || 'smtp.gmail.com',
  //   port: process.env.SMTP_PORT || 587,
  //   secure: false,
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASS
  //   }
  // });

  console.log("Email notifications initialized");
};

export const sendNotification = async (user, type, data) => {
  try {
    if (!user.preferences.notifications.email) return;

    let subject, html;

    switch (type) {
      case "post-published":
        subject = `Your ${data.postTitle} has been published!`;
        html = `
          <h2>Post Published Successfully!</h2>
          <p>Your ${data.postTitle} has been published to ${data.platforms.join(
          ", "
        )}.</p>
          <p>Status: ${data.status}</p>
        `;
        break;
      case "post-failed":
        subject = `Failed to publish your ${data.postTitle}`;
        html = `
          <h2>Post Publishing Failed</h2>
          <p>We encountered an issue publishing your ${data.postTitle}.</p>
          <p>Please check your social media connections and try again.</p>
        `;
        break;
      default:
        return;
    }

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || "noreply@sociobot.com",
      to: user.email,
      subject,
      html,
    });
  } catch (error) {
    console.error("Send notification error:", error);
  }
};

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify/${token}`;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || "noreply@sociobot.com",
    to: email,
    subject: "Verify your SocioBot account",
    html: `
      <h2>Welcome to SocioBot!</h2>
      <p>Please click the link below to verify your account:</p>
      <a href="${verificationUrl}">Verify Account</a>
    `,
  });
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || "noreply@sociobot.com",
    to: email,
    subject: "Reset your SocioBot password",
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `,
  });
};
