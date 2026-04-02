const nodemailer = require("nodemailer");
const path = require("path");
async function main() {
  const account = await nodemailer.createTestAccount();
  console.log("Ethereal account:", account.user);
  const t = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: account.user, pass: account.pass }
  });
  const info = await t.sendMail({
    from: "DA Prints AI <test@daprintsai.com>",
    to: "henry_alcaide@hotmail.com",
    subject: "Your DA Prints AI Purchase - Digital Downloads",
    html: "<h2>Thank you for your purchase!</h2><p>Order: AI Artwork - Fall Trail, AI Artwork - The Ship</p><p>Your 2 images are attached.</p>",
    attachments: [
      { filename: "FallForestTrail.png", path: path.join(__dirname, "images/products/FallForestTrail.png"), contentType: "image/png" },
      { filename: "Theship.png", path: path.join(__dirname, "images/products/Theship.png"), contentType: "image/png" }
    ]
  });
  console.log("Message sent:", info.messageId);
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
}
main().catch(console.error);
