const fs = require('fs');
const path = require('path');

// List of empty files that need basic content
const emptyFiles = [
  'src/app/dashboard/(buyer)/orders/page.tsx',
  'src/app/dashboard/(buyer)/settings/page.tsx',
  'src/app/dashboard/(buyer)/layout.tsx',
  'src/app/dashboard/(buyer)/page.tsx',
  'src/app/dashboard/(driver)/earnings/page.tsx',
  'src/app/dashboard/(driver)/shipments/page.tsx',
  'src/app/dashboard/(driver)/layout.tsx',
  'src/app/dashboard/buyer/inbox/page.tsx',
  'src/app/dashboard/driver/profile/page.tsx',
  'src/app/dashboard/driver/shipments/[id]/page.tsx',
  'src/app/dashboard/driver/shipments/[id]/ShipmentDetailClient.tsx'
];

// Basic templates for different types of files
const pageTemplate = (title, description) => `import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${title} - Thysia',
  description: '${description}'
}

export default function ${title.replace(/\s+/g, '')}Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">${title}</h1>
        <p className="mt-1 text-sm text-gray-600">
          ${description}
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600">This feature is under development.</p>
        </div>
      </div>
    </div>
  )
}`;

const layoutTemplate = (title) => `export default function ${title}Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}`;

const componentTemplate = (name) => `'use client'

export default function ${name}() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-4">${name}</h2>
      <p className="text-gray-600">Component under development.</p>
    </div>
  )
}`;

// File configurations
const fileConfigs = {
  'src/app/dashboard/(buyer)/orders/page.tsx': () => pageTemplate('Orders', 'View and manage your orders'),
  'src/app/dashboard/(buyer)/settings/page.tsx': () => pageTemplate('Settings', 'Manage your account settings'),
  'src/app/dashboard/(buyer)/layout.tsx': () => layoutTemplate('Buyer'),
  'src/app/dashboard/(buyer)/page.tsx': () => pageTemplate('Dashboard', 'Welcome to your buyer dashboard'),
  'src/app/dashboard/(driver)/earnings/page.tsx': () => pageTemplate('Earnings', 'View your delivery earnings'),
  'src/app/dashboard/(driver)/shipments/page.tsx': () => pageTemplate('Shipments', 'Manage your delivery shipments'),
  'src/app/dashboard/(driver)/layout.tsx': () => layoutTemplate('Driver'),
  'src/app/dashboard/buyer/inbox/page.tsx': () => pageTemplate('Inbox', 'Your messages and notifications'),
  'src/app/dashboard/driver/profile/page.tsx': () => pageTemplate('Profile', 'Manage your driver profile'),
  'src/app/dashboard/driver/shipments/[id]/page.tsx': () => pageTemplate('Shipment Details', 'View shipment details'),
  'src/app/dashboard/driver/shipments/[id]/ShipmentDetailClient.tsx': () => componentTemplate('ShipmentDetailClient')
};

console.log('Creating basic content for empty files...');

emptyFiles.forEach(filePath => {
  try {
    const fullPath = path.resolve(filePath);
    
    // Check if file exists and is empty
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      if (stats.size === 0) {
        const content = fileConfigs[filePath]();
        fs.writeFileSync(fullPath, content);
        console.log(`✅ Created content for: ${filePath}`);
      } else {
        console.log(`⚠️ Skipped (not empty): ${filePath}`);
      }
    } else {
      console.log(`❌ File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('✨ Done! All empty files have been filled with basic content.');
