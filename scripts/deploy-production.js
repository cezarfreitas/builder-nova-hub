const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Production Deployment Script");
console.log("================================");

// 1. Backup current data
console.log("\n📦 Step 1: Creating backup...");
try {
  execSync("node scripts/backup-data.js", { stdio: "inherit" });
} catch (error) {
  console.error("⚠️  Backup failed, but continuing...");
}

// 2. Verify critical files exist
console.log("\n🔍 Step 2: Verifying critical files...");

const criticalFiles = [
  "server/data/hero.json",
  "server/data/settings.json",
  "public/uploads",
];

let allFilesExist = true;
criticalFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ Missing: ${file}`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log(
    "\n⚠️  Some critical files are missing. Deployment may have issues.",
  );
}

// 3. Build for production
console.log("\n🔨 Step 3: Building for production...");
try {
  execSync("npm run build:prod", { stdio: "inherit" });
  console.log("✅ Build completed successfully");
} catch (error) {
  console.error("❌ Build failed");
  process.exit(1);
}

// 4. Verify build output
console.log("\n🔍 Step 4: Verifying build output...");
const buildFiles = ["dist/spa/index.html", "dist/spa/assets"];

buildFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ Missing build file: ${file}`);
  }
});

// 5. Check if uploads directory will be preserved
console.log("\n📁 Step 5: Upload directory status...");
if (fs.existsSync("public/uploads")) {
  const uploadStats = fs.readdirSync("public/uploads", { recursive: true });
  console.log(`✅ Uploads directory contains ${uploadStats.length} items`);

  // List hero images specifically
  const heroDir = "public/uploads/hero";
  if (fs.existsSync(heroDir)) {
    const heroImages = fs.readdirSync(heroDir);
    console.log(`📸 Hero images: ${heroImages.length} files`);
    heroImages.forEach((img) => console.log(`   - ${img}`));
  }
} else {
  console.log("❌ Uploads directory not found");
}

// 6. Show deployment checklist
console.log("\n📋 Deployment Checklist:");
console.log("======================");
console.log("☐ Upload dist/spa/* to your web server");
console.log("☐ Upload server/* to your backend server");
console.log("☐ Ensure public/uploads/* is preserved/uploaded");
console.log("☐ Ensure server/data/*.json files are preserved");
console.log("☐ Set environment variables (DB credentials, etc.)");
console.log("☐ Start the server with: npm run start:prod");

console.log("\n🎯 Critical for Hero Section:");
console.log("=============================");
console.log("1. server/data/hero.json must be readable by the server");
console.log("2. public/uploads/hero/* images must be accessible via HTTP");
console.log("3. The server must have write permissions to server/data/");

console.log("\n✅ Pre-deployment checks completed!");
