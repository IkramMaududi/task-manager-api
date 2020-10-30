const nodeMailjet = require ('node-mailjet');
  
const mailjet = nodeMailjet.connect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY);

const sendWelcomeEmail = (name, email) => { 
  const filler = {
      "Messages":[
       {
        "From": {
          "Email": "maududiikram@yahoo.com",
          "Name": "maududi"
        },
        "To": {
          "Email": `${email}`,
          "Name": `${name}`
        },
        "Subject": "Greetings from Mailjet.",
        "TextPart": "My first Mailjet email",
        "HTMLPart": `<h3>Dear new user</h3><br>Welcome to the app, ${name}. Let me know if you have fun with the app`,
        "CustomID": "AppGettingStartedTest"
       }
      ]
  };
  const final = mailjet
    .post("send", {'version': 'v3.1'})
    .request(filler)
    .then( res => { console.log(res.body) } ) 
    .catch( err => { console.log(err.statusCode) } );
  return final;
};
  
const sendCancelationEmail = (name, email) => { 
  const filler = {
      "Messages":[
       {
        "From": {
          "Email": "maududiikram@yahoo.com",
          "Name": "maududi"
        },
        "To": {
          "Email": `${email}`,
          "Name": `${name}`
        },
        "Subject": "Greetings from Mailjet.",
        "TextPart": "My first Mailjet email",
        "HTMLPart": `<h3>Dear new user</h3><br>Goodbye to the app, ${name}. Let me know if you need our help`, 
        "CustomID": "AppGettingStartedTest"
       }
      ]
  };
  const final = mailjet
    .post("send", {'version': 'v3.1'})
    .request(filler)
    .then( res => { console.log(res.body) } ) 
    .catch( err => { console.log(err.statusCode) } );
  return final;
};



module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
};








