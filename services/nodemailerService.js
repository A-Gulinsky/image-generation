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
    { email: process.env.NODEMAILER_RECIPIENT, isCustomer: false },
    { email: data.email, isCustomer: true },
  ];

  const htmlContent = `
    <h2 style="line-height:normal;font-size: 14px;">Here are the details of the wallpapers you’ve recently generated. We’ll be in touch with you shortly!</h2>
    <p style="margin: 4px 0;"><strong>Wall width</strong>: ${data.wall_width}in</p>
    <p style="margin: 4px 0;"><strong>Wall height</strong>: ${data.wall_height}in</p>
    <p style="margin: 4px 0;"><strong>Customer Email:</strong> <strong>${data.email}</strong></p>
    <p style="margin: 4px 0;"><strong>Customer Preferences:</strong> ${data.preferences}</p>
  `;

  for (const recipient of recipients) {
    const imageBase64 = recipient.isCustomer ? await imageWithWaterMark(data.image_base64) : data.image_base64;
    const subject = recipient.isCustomer ? 
    'Your wallpaper details are here!' :
    `Costa Cover Wall Generation ${generateRandomDigits()}`

    const attachments = [
      {
        filename: `image-generation.webp`,
        content: imageBase64,
        encoding: 'base64',
        cid: "geminiImage",
        contentType: 'image/webp'
      },
    ];

    await transport.sendMail({
      from: MY_EMAIL,
      to: recipient.email,
      subject: subject,
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
    result += Math.floor(Math.random() * 10);
  }
  return result;
}