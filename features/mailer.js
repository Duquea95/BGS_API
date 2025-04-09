const nodemailer = require('nodemailer');

// Configure transporter
let transporter = nodemailer.createTransport({
  service: 'Gmail', // or another email provider
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: 'duquea95@gmail.com',
    pass: 'bcut azhn nnms edsv',
  },
});

const sendEmail = async (adminEmail, transactionDetails) => {
  let mailOptions = {
    from: 'duquea95@gmail.com',
    to: adminEmail,
    subject: transactionDetails.subject,
    text: transactionDetails.text,
    html: transactionDetails?.html
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};



module.exports={
  sendEmail
}