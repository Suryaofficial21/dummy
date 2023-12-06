import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: options.user_name?process.env.CONTACT_SMTP_FROM_EMAIL:process.env.FPWD_SMTP_EMAIL,
      pass: options.user_name?process.env.CONTACT_SMTP_PASSWORD:process.env.FPWD_SMTP_PASSWORD,
    },
  });
  

  const message = {
    
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transport.sendMail(message);
};

export default sendEmail;