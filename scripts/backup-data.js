const fs = require("fs");
const path = require("path");

const BACKUP_DIR = "production-backups";
const DATA_DIR = "server/data";
const UPLOADS_DIR = "public/uploads";

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

console.log("🔄 Creating production backup...");

// Create backup subdirectory
fs.mkdirSync(backupPath, { recursive: true });

// Backup data files
if (fs.existsSync(DATA_DIR)) {
  console.log("📁 Backing up data files...");
  const dataBackupPath = path.join(backupPath, "data");
  fs.mkdirSync(dataBackupPath, { recursive: true });

  // Copy all JSON files from data directory
  const dataFiles = fs.readdirSync(DATA_DIR);
  dataFiles.forEach((file) => {
    if (file.endsWith(".json")) {
      const sourcePath = path.join(DATA_DIR, file);
      const destPath = path.join(dataBackupPath, file);
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Backed up: ${file}`);
    }
  });
}

// Backup uploads directory structure (just the file list for reference)
if (fs.existsSync(UPLOADS_DIR)) {
  console.log("📁 Creating uploads inventory...");
  const uploadsInventory = {};

  const scanDirectory = (dir, basePath = "") => {
    const items = fs.readdirSync(dir);
    items.forEach((item) => {
      const itemPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);

      if (fs.statSync(itemPath).isDirectory()) {
        uploadsInventory[relativePath] = "directory";
        scanDirectory(itemPath, relativePath);
      } else {
        const stats = fs.statSync(itemPath);
        uploadsInventory[relativePath] = {
          type: "file",
          size: stats.size,
          modified: stats.mtime.toISOString(),
        };
      }
    });
  };

  scanDirectory(UPLOADS_DIR);

  const inventoryPath = path.join(backupPath, "uploads-inventory.json");
  fs.writeFileSync(inventoryPath, JSON.stringify(uploadsInventory, null, 2));
  console.log("✅ Created uploads inventory");
}

console.log(`✅ Backup completed: ${backupPath}`);
console.log("\n📋 Files included in backup:");
console.log("- server/data/*.json (configuration files)");
console.log("- uploads-inventory.json (list of uploaded files)");
console.log(
  "\n⚠️  Note: Upload files themselves are not backed up due to size.",
);
console.log(
  "   Ensure your deployment preserves the public/uploads directory.",
);
