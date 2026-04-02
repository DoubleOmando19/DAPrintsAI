const nm=require("nodemailer"),p=require("path"),fs=require("fs");
(async()=>{
  const a=await nm.createTestAccount();
  console.log("Account:",a.user);
  const t=nm.createTransport({host:"smtp.ethereal.email",port:587,secure:false,auth:{user:a.user,pass:a.pass}});
  const i=await t.sendMail({
    from:"DA Prints AI <test@daprintsai.com>",
    to:"henry_alcaide@hotmail.com",
    subject:"Your DA Prints AI Purchase - Digital Downloads",
    html:"<h2>Thank you for your purchase</h2><p>Your 2 images are attached.</p>",
    attachments:[
      {filename:"FallForestTrail.png",path:p.join(__dirname,"images/products/FallForestTrail.png")},
      {filename:"Theship.png",path:p.join(__dirname,"images/products/Theship.png")}
    ]
  });
  const url=nm.getTestMessageUrl(i);
  fs.writeFileSync("/tmp/preview_url.txt",url);
  console.log("Sent:",i.messageId);
  console.log("URL:",url);
})().catch(console.error);
