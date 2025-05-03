import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


console.log("Cloudinary environment variables:");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET);

// Validate environment variables


cloudinary.config({ 
  cloud_name: 'dbohwdvjh', 
  api_key: '465895597545426', 
  api_secret: '0LsivxNNKPOdte07N3Z7p1zH5h4' 
});

console.log("Cloudinary configuration:", cloudinary.config());

// Test the configuration
try {
    const testConfig = cloudinary.config();
    if (!testConfig.cloud_name || !testConfig.api_key || !testConfig.api_secret) {
        console.error("Error: Cloudinary configuration is invalid");
        console.error("Please verify your Cloudinary credentials in the .env file");
        process.exit(1);
    }
} catch (error) {
    console.error("Error testing Cloudinary configuration:", error);
    process.exit(1);
}

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("No file path provided");
            return null;
        }
        
        console.log("Uploading file to Cloudinary:", localFilePath);
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        
        console.log("Cloudinary upload successful:", response.url);
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        console.error("Cloudinary upload error:", error);
        if (localFilePath) {
            try {
                fs.unlinkSync(localFilePath);
            } catch (unlinkError) {
                console.error("Error deleting temporary file:", unlinkError);
            }
        }
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
}



export {uploadOnCloudinary}