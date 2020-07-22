const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nxtiptop@gmail.com",
    pass: "abcd@1234",
  },
});

var mailoptions = {
  from: "nxtiptop@gmail.com",
};

function getOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}

exports.sendOTP = (tomail) => {
  mailoptions.to = tomail;
  mailoptions.subject = "OTP Verification Email";
  otp = getOTP();
  mailoptions.text = "Use OTP " + otp + " for Email Verification";
  transporter.sendMail(mailoptions, (err, info) => {
    if (err) {
      // console.log(err)
    } else {
      // console.log('Email Sent')
    }
  });
  return otp;
};
