
import User from "../models/user";
import { hashPassword, comparePassword } from "../helpers/auth";
import jwt from "jsonwebtoken";
import nanoid from "nanoid";
import {clodinaryImageUpload} from "../helpers/clodinary"

// sendgrid
require("dotenv").config();
const sgMail = require("@sendgrid/mail");
console.log("SENDGRID_KEY is :",process.env.SENDGRID_KEY)
sgMail.setApiKey(process.env.SENDGRID_KEY);

export const signup = async (req, res) => {
  console.log("HIT SIGNUP");
    const { name, email, password } = req.body;
    console.log(req.body)
  try {
    // validation
    const { name, email, password } = req.body;
    if (!name) {
      return res.json({
        error: "Name is required",
      });
    }
    if (!email) {
      return res.json({
        error: "Email is required",
      });
    }
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({
        error: "Email is taken",
      });
    }
    // hash password
    const hashedPassword = await hashPassword(password);

    try {
      const user = await new User({
        name,
        email,
        password: hashedPassword,
      }).save();

      console.log(process.env.JWT_SECRET)
      console.log(user._id)
      // create signed token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      //   console.log(user);
      const { password, ...rest } = user._doc;
      return res.json({
        token,
        user: rest,
      });
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
};

export const signin = async (req, res) => {
  // console.log(req.body);
  try {
    const { email, password } = req.body;
    // check if our db has user with that email
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        error: "No user found",
      });
    }
    // check password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({
        error: "Wrong password",
      });
    }
    // create signed token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user.password = undefined;
    user.secret = undefined;
    res.json({
      token,
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("USer email is:",email)
  // find user by email
  const user = await User.findOne({ email });
  console.log("USER ===> ", user);
  if (!user) {
    return res.json({ error: "User not found" });
  }
  else{
    console.log("User found")
  }
  // generate code
  const resetCode = nanoid(5).toUpperCase();
  // save to db
  user.resetCode = resetCode;
  user.save();
  // prepare email
  // to: user.email,
  //christyalex1998@gmail.com
  const html_code=`<div><h2>Welcome to Chris</h2><p>Your password reset code is <a href="https://www.google.com"> ${resetCode}</a></p></div>`
  const emailData = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Password reset code",
    text: 'and easy to do anywhere, even with Node.js',
    html: html_code
  };
  // send email
  console.log(emailData)
  try {
    const data = await sgMail.send(emailData);
    console.log(data);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.json({ ok: false });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password, resetCode } = req.body;
    console.log(email)
    console.log(password)
    console.log(resetCode)
    // find user based on email and resetCode
    const user = await User.findOne({ email, resetCode });
    // if user not found
    if (!user) {
      return res.json({ error: "Email or reset code is invalid" });
    }
    // if password is short
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }
    // hash password
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.resetCode = "";
    user.save();
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};
export const updatePassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email)
    console.log(password)
    // find user based on email and resetCode
    const user = await User.findOne({ email });
    // if user not found
    if (!user) {
      return res.json({ error: "Email or reset code is invalid" });
    }
    //if email is not present
    if(!email)
    {
      return res.json({
        error:"email must be present"
      })
    }
    // if password is short
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }
    // hash password
   
    const hashedPassword = await hashPassword(password);
    console.log("current password is =>",user.password)
    console.log("new password is =>",hashedPassword)
    user.password = hashedPassword;
    user.save();
    return res.json({ ok: true,message:"password updated succesfully" });
  } catch (err) {
    console.log(err);
  }
};

export const uploadImage=async(req,res)=>
{
  try {
    const { email, image } = req.body;
    console.log("Email=>",email)
    console.log("Image=>",image)
    // find user based on email and resetCode
    const user = await User.findOne({ email });
    if(!user)
    {
      res.json({error:"unable to find the user, check the email"})
    }
    //sending the image to the clodinary for the image upload 
    const {public_id,secure_url,url}=await clodinaryImageUpload(image)
    console.log(public_id,"   ",secure_url,"   ",url)
    // user.image={"public_id":public_id,"url":url}
    //adding new filed for the image details
   const updateUser= await User.updateOne(
      {email: email },
      { $set:{"image":{"public_id":public_id,"url":secure_url}} }
    )
    console.log("updating user",updateUser)
    res.json({"success":true,"url":url})

  }
  catch (err) {
    console.log(err);
  }
  
}
