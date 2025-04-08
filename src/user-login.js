import mongoose from 'mongoose'

// export const UserSchema = new mongoose.Schema({

//     name: { type: String, required: true },
//     email_address: { type: String, required: true },
//     password: { type: String, required: true },
//     age: { type: Date, required: true }
// });
// const User = mongoose.model('User', UserSchema)
//  export default User;


const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('/user-login')

loginRouter.post('/login', async (request, response) => {
  const { email_address, password } = request.body

  const user = await User.findOne({ email_address })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter