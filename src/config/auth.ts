export default {
  jwt: {
    secret: process.env.JWT_SECRET || 'secret' as string,
    expiresIn: '1d'
  }
}
