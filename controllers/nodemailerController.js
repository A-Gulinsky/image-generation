import * as mailService from "../services/nodemailerService.js";

export async function sendMailController(req, res, next) {
  try {
    const data = {
      email: req.body.email,
      image_base64: req.body.image_base64,
      wall_height: req.body.wall_height,
      wall_width: req.body.wall_width
    }
    if (!data.image_base64) return res.status(400).json({ status: "error", message: "image required" });
    const info = await mailService.sendMail(data);
    return res.json({ status: "ok", info });
  } catch (err) {
    next(err);
  }
}