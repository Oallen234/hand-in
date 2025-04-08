import mongoose from 'mongoose'
let loggedIn = false

export const UserSchema = new mongoose.Schema({

    name: { type: String, required: true },
    email_address: { type: String, required: true },
    password: { type: String, required: true },
    age: { type: Date, required: true }
});
const User = mongoose.model('User', UserSchema)
export default User;


