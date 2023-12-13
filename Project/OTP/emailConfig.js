const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'p200165@pwr.nu.edu.pk', 
    pass: 'Jadi7788991010_tazmeen', 
  },
});

module.exports = transporter;
