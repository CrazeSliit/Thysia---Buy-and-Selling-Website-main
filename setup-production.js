#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up production database schema...');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
const productionSchemaPath = path.join(__dirname, 'prisma', 'schema-production.prisma');
const backupSchemaPath = path.join(__dirname, 'prisma', 'schema-sqlite-backup.prisma');

try {
  // Backup current schema
  if (fs.existsSync(schemaPath)) {
    const currentSchema = fs.readFileSync(schemaPath, 'utf8');
    fs.writeFileSync(backupSchemaPath, currentSchema);
    console.log('✅ Backed up current schema to schema-sqlite-backup.prisma');
  }

  // Copy production schema to main schema
  if (fs.existsSync(productionSchemaPath)) {
    const productionSchema = fs.readFileSync(productionSchemaPath, 'utf8');
    fs.writeFileSync(schemaPath, productionSchema);
    console.log('✅ Switched to production PostgreSQL schema');
  } else {
    console.error('❌ Production schema file not found');
    process.exit(1);
  }

  console.log('🎉 Production setup complete!');
} catch (error) {
  console.error('❌ Error setting up production schema:', error.message);
  process.exit(1);
}
