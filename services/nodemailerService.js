import nodemailer from 'nodemailer';

export async function sendMail(data) {

  const NODEMAILER_PASS = process.env.NODEMAILER_PASS
  const MY_EMAIL = process.env.NODEMAILER_SENDER
  const to = process.env.NODEMAILER_RECIPIENT

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
  const subject = "This Is Sent By NodeMailer";
  const html = `
    <p>Wall width: ${data.wall_width}in</p>
    <p>Wall height: ${data.wall_height}in</p>
    <p>Customer Email: <strong style="color: #000">${data.email}</strong></p>
    <img src="cid:geminiImage" style="width:300px;" />
    `;
  return new Promise((resolve, reject) => {
    transport.sendMail({ from, subject, to, html, attachments }, (err, info) => {
      if (err) reject(err);
      resolve(info);
    });
  });
}