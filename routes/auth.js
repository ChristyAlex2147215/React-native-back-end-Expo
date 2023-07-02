
import express from "express";

const router = express.Router();

// controllers
const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  updatePassword,
  requireLogin,
  uploadImage
} = require("../controllers/auth");

router.get("/", (req, res) => {
  return res.json({
    data: "Good Mornig from the server API",
  });
});
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/update-password",requireLogin,updatePassword);
router.post("/upload-image",requireLogin,uploadImage)

export default router;
