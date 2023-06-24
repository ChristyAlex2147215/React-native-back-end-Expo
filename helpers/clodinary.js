const cloudinary = require("cloudinary").v2;

export const clodinaryImageUpload=async(image)=>
{
    cloudinary.config({ 
        cloud_name:process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_KEY, 
        api_secret: process.env.CLOUDINARY_SECRET
      });
      try {
        const uploadResult = await cloudinary.uploader.upload(image, {
          folder: "server-uploads", // Optional: specify a folder in Cloudinary to store the image
        });
    
        console.log("Image upload result:", uploadResult);
        return {"public_id":uploadResult.public_id,"secure_url":uploadResult.secure_url,"url":uploadResult.url}
    
        // Additional actions with the upload result
      } catch (error) {
        console.error("Image upload error:", error);
      }
    // console.log("Image upload status to cludinary is =>",uploadResult)
}