
export function checkAccessibility(req,res,next) {
  const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

  const origin = req.headers.origin
  
  // honeypot
  // const honeypot = req.body.honeypot

  // if(honeypot) {
  //   return res.status(400).json({ status:"error", message:"Bot detected" });
  // }

  if(!origin) {
    console.log('Origin missing')
    return res.status(403).json({status: 'error', message: 'Origin missing' })
  }

  if(origin != ALLOWED_ORIGIN) {
    console.log('Invalid Origin')
    return res.status(403).json({stauts: 'error', message: 'Invalid Origin'})
  }

  next()
}