const { execSync } = require('child_process');

console.log('🔧 Starting Vercel build process...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Push database schema
  console.log('🗄️ Pushing database schema to MongoDB...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

  // Build Next.js application
  console.log('🚀 Building Next.js application...');
  execSync('npx next build', { stdio: 'inherit' });

  console.log('✅ Build process completed!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
