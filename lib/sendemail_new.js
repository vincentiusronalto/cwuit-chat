const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const api_key = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN_SANDBOX;


const mg = mailgun.client({username: 'api', key: api_key});



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