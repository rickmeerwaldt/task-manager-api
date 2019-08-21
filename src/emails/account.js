const sgMail = require('@sendgrid/mail');

const sendgridApiKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridApiKey)

const sendWelcomeEmail = (email, name) => {
  console.log('Sending email to:', email, name)
  sgMail.send({
    to: email,
    from: 'rickmeerwaldt@hotmail.com',
    subject: 'Welcome',
    text: `Hello ${name}`,
  })
}

const sendGoobyeEmail = (email, name) => {
  console.log('Sending email to:', email, name)
  sgMail.send({
    to: email,
    from: 'rickmeerwaldt@hotmail.com',
    subject: 'Goodbye',
    text: `Goodbye ${name}`,
  })
}

module.exports = { sendWelcomeEmail, sendGoobyeEmail }