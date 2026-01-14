import * as googleGenService from "../services/googleGenService.js"

export async function generateImage(req, res, next) {
  try {
    const payload = req.body;
    const { prompt } = payload;
    if (!prompt) return res.status(400).json({ status: "error", message: "prompt required" });

    const imageBuffer = await googleGenService.getImageBuffer(payload);
    res.set({
      "Content-Type": "image/png",
      "Content-Length": imageBuffer.length,
      "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN,
      "X-Image-ID": "image-id-optional"
    });
    return res.end(imageBuffer);
  } catch (err) {
    next(err);
  }
}