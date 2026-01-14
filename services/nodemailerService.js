import nodemailer from 'nodemailer';
import sharp from "sharp";
import path from 'path';

export async function sendMail(data) {

  const NODEMAILER_PASS = process.env.NODEMAILER_PASS
  const MY_EMAIL = process.env.NODEMAILER_SENDER

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user: MY_EMAIL, pass: NODEMAILER_PASS },
    tls: { rejectUnauthorized: true },
  });

  const recipients = [
    { email: process.env.NODEMAILER_RECIPIENT, watermark: false },
    { email: data.email, watermark: true },
  ];

  const htmlContent = `
    <p><strong>Wall width</strong>: ${data.wall_width}in</p>
    <p><strong>Wall height</strong>: ${data.wall_height}in</p>
    <p><strong>Customer Email:</strong> <strong>${data.email}</strong></p>
    <p><strong>Customer Preferences:</strong> ${data.preferences}</p>
    <img src="cid:geminiImage" style="width:300px;" />
  `;

  for (const recipient of recipients) {
    const imageBase64 = recipient.watermark
      ? await imageWithWaterMark(data.image_base64)
      : data.image_base64;

    const attachments = [
      {
        filename: `image-generation.png`,
        content: imageBase64,
        encoding: 'base64',
        cid: "geminiImage",
      },
    ];

    await transport.sendMail({
      from: MY_EMAIL,
      to: recipient.email,
      subject: `Costa Cover Wall Generation ${generateRandomDigits()}`,
      html: htmlContent,
      attachments,
    });
  }
}

const imageWithWaterMark = async(image) => {
  const mainImage = sharp(Buffer.from(image, 'base64'));
  const { width, height } = await mainImage.metadata();

  const watermarkBuffer = await sharp(path.join(process.cwd(), 'files', 'watermark.webp'))
    .resize(width, height, { fit: 'cover' })
    .ensureAlpha()
    .toBuffer();

  const imageWithWatermark = await mainImage
    .composite([
      {
        input: watermarkBuffer,
        opacity: 1, 
        blend: 'overlay',
        gravity: 'southeast',
      },
    ])
    .toBuffer();

  return imageWithWatermark.toString('base64');
}

function generateRandomDigits(length = 4) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10); // цифра от 0 до 9
  }
  return result;
}