import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Fails fast at startup if credentials are wrong, instead of failing silently on first send
transporter.verify((err) => {
  if (err) {
    console.error("Mailer configuration error:", err.message);
  } else {
    console.log("Mailer ready to send emails");
  }
});

export default transporter;