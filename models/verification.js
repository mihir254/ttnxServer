const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VerificationSchema = new Schema({
    email:String,
    otpToken:Number
})

const Verification = mongoose.model('Verification',VerificationSchema);
module.exports = Verification;