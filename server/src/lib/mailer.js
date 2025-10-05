import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (!transporter) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
    if (!SMTP_HOST) {
      transporter = {
        async sendMail(message) {
          console.log('Email send simulated:', message);
          return { messageId: 'simulated' };
        }
      };
    } else {
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT ?? 587),
        secure: Number(SMTP_PORT ?? 587) === 465,
        auth: SMTP_USER
          ? {
              user: SMTP_USER,
              pass: SMTP_PASSWORD
            }
          : undefined
      });
    }
  }
  return transporter;
}

export async function sendOrderEmail({ to, subject, html }) {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: process.env.SMTP_FROM || 'orders@bubblingbathdelights.com',
    to,
    subject,
    html
  });
}
