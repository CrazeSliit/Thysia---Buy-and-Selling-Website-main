#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Restoring development database schema...');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
const backupSchemaPath = path.join(__dirname, 'prisma', 'schema-sqlite-backup.prisma');

try {
  // Restore SQLite schema from backup
  if (fs.existsSync(backupSchemaPath)) {
    const backupSchema = fs.readFileSync(backupSchemaPath, 'utf8');
    fs.writeFileSync(schemaPath, backupSchema);
    console.log('✅ Restored SQLite schema for development');
  } else {
    console.log('⚠️  No backup found, keeping current schema');
  }

  console.log('🎉 Development setup complete!');
} catch (error) {
  console.error('❌ Error restoring development schema:', error.message);
  process.exit(1);
}
