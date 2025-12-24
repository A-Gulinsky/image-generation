import nodemailer from 'nodemailer';

export async function sendMail(data) {

  const NODEMAILER_PASS = process.env.NODEMAILER_PASS
  const MY_EMAIL = process.env.NODEMAILER_SENDER
  const to = [process.env.NODEMAILER_RECIPIENT, data.email]

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: MY_EMAIL,
      pass: NODEMAILER_PASS,
    },
    tls: { rejectUnauthorized: true },
  });

  const attachments = [
    {
      filename: `image-generation.png`,
      content: data.image_base64,
      encoding: 'base64',
      cid: "geminiImage",
    }
  ]

  const from = MY_EMAIL;
  const subject = "Costa Cover Wall Generation";
  const html = `
    <p><strong>Wall width</strong>: ${data.wall_width}in</p>
    <p><strong>Wall height</strong>: ${data.wall_height}in</p>
    <p><strong>Customer Email:</strong> <strong>${data.email}</strong></p>
    <p><strong>Customer Preferences:</strong> ${data.preferences}</p>
    <img src="cid:geminiImage" style="width:300px;" />
    `;
  return new Promise((resolve, reject) => {
    transport.sendMail({ from, subject, to, html, attachments }, (err, info) => {
      if (err) reject(err);
      resolve(info);
    });
  });
}