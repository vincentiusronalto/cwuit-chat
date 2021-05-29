const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const api_key = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN_SANDBOX;


const mg = mailgun.client({username: 'api', key: api_key});

// const mg = mailgun.client({
//     username: 'api',
//     key: process.env.MAILGUN_API_KEY || '',
//     public_key: process.env.MAILGUN_PUBLIC_KEY || 'pubkey-yourkeyhere'
//   });


//   mg.messages.create('sandbox-123.mailgun.org', {
//     from: "Excited User <mailgun@sandbox-123.mailgun.org>",
//     to: ["test@example.com"],
//     subject: "Hello",
//     text: "Testing some Mailgun awesomness!",
//     html: "<h1>Testing some Mailgun awesomness!</h1>"
//   })
//   .then(msg => console.log(msg)) // logs response data
//   .catch(err => console.log(err)); // logs any error

  const sendEmail = (data) => {
  
    return new Promise((resolve,reject)=>{
      mg.messages.create(domain, data, function (err, body) {
        console.log(body);
     
        if(err){
          resolve(false)
        }else{
          resolve(true)
        }
  
      });
    })
  }
  
  module.exports = sendEmail;