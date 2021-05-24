
const api_key = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN_SANDBOX;
const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
 
const sendEmail = (data) => {
  
  return new Promise((resolve,reject)=>{
    mailgun.messages().send(data, function (err, body) {
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


//EXAMPLE DATA
// const data = {
//   from: 'Excited User <me@samples.mailgun.org>',
//   to: 'serobnic@mail.ru',
//   subject: 'Hello',
//   text: 'Testing some Mailgun awesomeness!'
// }