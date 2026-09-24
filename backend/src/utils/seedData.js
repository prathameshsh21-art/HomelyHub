import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Property } from "../Models/propertyModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend root
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Recursive helper to transform MongoDB Extended JSON ($oid, $date)
export function transformExtendedJson(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(transformExtendedJson);
  }

  // Handle $oid
  if (obj.$oid && typeof obj.$oid === "string" && Object.keys(obj).length === 1) {
    return new mongoose.Types.ObjectId(obj.$oid);
  }

  // Handle $date
  if (obj.$date && Object.keys(obj).length === 1) {
    return new Date(obj.$date);
  }

  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = transformExtendedJson(obj[key]);
  }
  return result;
}

export const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");

    // Locate dataset file
    const candidatePaths = [
      path.join(__dirname, "../data/test.properties.json"),
      path.join(__dirname, "../data/test.properties (1).json"),
      path.join(__dirname, "../../data/test.properties.json"),
      path.join(__dirname, "../../data/test.properties (1).json"),
      path.join(__dirname, "../../test.properties (1).json"),
      "C:/Users/DELL/Downloads/test.properties (1).json",
      "C:/Users/DELL/Downloads/test.properties.json",
    ];

    let filePath = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }

    if (!filePath) {
      throw new Error("Could not find test.properties (1).json in any standard location");
    }

    console.log(`Reading property data from: ${filePath}`);
    const rawData = fs.readFileSync(filePath, "utf8");
    const jsonRecords = JSON.parse(rawData);

    if (!Array.isArray(jsonRecords) || jsonRecords.length === 0) {
      throw new Error("JSON file does not contain a non-empty array of properties");
    }

    console.log(`Parsed ${jsonRecords.length} records from JSON file. Importing into properties collection...`);

    let upsertedCount = 0;
    for (const record of jsonRecords) {
      const transformed = transformExtendedJson(record);

      // Normalize checkIn/checkOut typos if present
      if (!transformed.checkInTime && transformed.chekInTime) {
        transformed.checkInTime = transformed.chekInTime;
      }
      if (!transformed.checkOutTime && transformed.chekOutTime) {
        transformed.checkOutTime = transformed.chekOutTime;
      }

      const filter = { _id: transformed._id };
      await Property.updateOne(filter, { $set: transformed }, { upsert: true });
      upsertedCount++;
    }

    console.log(`Successfully imported/upserted ${upsertedCount} property records without duplicates.`);

    const totalCount = await Property.countDocuments();
    console.log(`Total properties currently in collection: ${totalCount}`);

    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

// If run directly via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase();
}
