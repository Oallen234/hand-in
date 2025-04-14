import mongoose from 'mongoose'


export const EmailSubmissionSchema = new mongoose.Schema({

    name: { type: String, required: true },
    email: { type: String, required: true }
});
const Email = mongoose.model('Email', EmailSubmissionSchema)
export default Email;
