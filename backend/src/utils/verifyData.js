import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Property } from "../Models/propertyModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

export const verifyData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    console.log("Connecting to MongoDB for verification...");
    await mongoose.connect(process.env.MONGO_URI);

    const count = await Property.countDocuments();
    console.log(`\n=== Verification Results ===`);
    console.log(`1. Total property documents: ${count}`);

    if (count === 0) {
      throw new Error("No property documents found in collection!");
    }

    const properties = await Property.find();
    let allValid = true;
    let imagesChecked = 0;

    for (const p of properties) {
      if (!p.propertyName || p.propertyName.trim() === "") {
        console.error(`FAIL: Property ${p._id} missing propertyName`);
        allValid = false;
      }

      if (!p.slug || p.slug.trim() === "") {
        console.error(`FAIL: Property ${p._id} missing slug`);
        allValid = false;
      }

      if (!p.address || !p.address.city || !p.address.state) {
        console.error(`FAIL: Property ${p._id} missing address details`);
        allValid = false;
      }

      if (!Array.isArray(p.images) || p.images.length === 0) {
        console.error(`FAIL: Property ${p._id} has invalid or empty images array`);
        allValid = false;
      } else {
        for (const img of p.images) {
          if (!img.url || typeof img.url !== "string" || img.url.trim() === "") {
            console.error(`FAIL: Property ${p._id} has empty image URL`);
            allValid = false;
          }
          imagesChecked++;
        }
      }
    }

    console.log(`2. Checked ${properties.length} properties.`);
    console.log(`3. Verified ${imagesChecked} image URLs (all non-empty strings).`);
    console.log(`4. Address and slug fields verified.`);
    console.log(`5. Overall data integrity: ${allValid ? "PASSED" : "FAILED"}`);
    console.log(`============================\n`);

    await mongoose.disconnect();
    return allValid;
  } catch (error) {
    console.error("Verification failed:", error.message);
    process.exit(1);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  verifyData();
}
