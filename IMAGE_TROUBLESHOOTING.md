# Image Display Issues - Troubleshooting Guide

## Problem: Images Not Showing in Product Listings

### 🔍 **Common Causes**

1. **Wrong URL Type**: Using page URLs instead of direct image URLs
2. **Domain Not Configured**: Image domain not allowed in Next.js config
3. **Invalid URL Format**: URL doesn't point to an actual image file
4. **Network Issues**: Image host is blocking requests or unavailable

### 🛠️ **Step-by-Step Fix**

#### 1. Test Your Image URL

Visit this page to test your image URLs:
```
http://localhost:3000/debug/images
```

This tool will:
- ✅ Check if URL is valid
- ✅ Test if image is accessible
- ✅ Verify it's a direct image URL
- ✅ Show content type and file size
- ✅ Provide specific recommendations

#### 2. Fix ImgBB URLs

**❌ Wrong** (Page URL):
```
https://ibb.co/b5wCQRhp
```

**✅ Correct** (Direct URL):
```
https://i.ibb.co/xxxxxx/image.jpg
```

**How to get the correct URL:**
1. Go to your ImgBB image page
2. Right-click on the image → "Copy Image Address"
3. Or look for "Direct Link" option on ImgBB
4. Use that URL in your product form

#### 3. Supported Image Domains

Your Next.js app supports these domains:
- ✅ `i.ibb.co` - ImgBB direct images
- ✅ `images.unsplash.com` - Unsplash images
- ✅ `res.cloudinary.com` - Cloudinary
- ✅ `via.placeholder.com` - Placeholder images
- ✅ `picsum.photos` - Lorem Picsum

### 🧪 **Testing Process**

1. **Get your image URL** from ImgBB, Unsplash, etc.
2. **Test it** at `/debug/images`
3. **Fix any issues** shown in recommendations
4. **Use the working URL** in your product creation form

### 📝 **Example Working URLs**

```javascript
// ImgBB (correct format)
https://i.ibb.co/abc123/product-image.jpg

// Unsplash
https://images.unsplash.com/photo-1234567890/product.jpg

// Cloudinary
https://res.cloudinary.com/your-cloud/image/upload/v123/product.jpg

// Placeholder (for testing)
https://via.placeholder.com/400x300
```

### 🚨 **Common Mistakes**

1. **Using page URLs**: `https://ibb.co/b5wCQRhp` ❌
2. **Missing file extension**: URL should end with `.jpg`, `.png`, etc.
3. **Private/protected images**: Images that require login won't work
4. **HTTP instead of HTTPS**: Only HTTPS URLs are allowed

### 🔧 **Quick Fixes**

**If image still doesn't show after fixing URL:**

1. **Clear browser cache** (Ctrl+F5)
2. **Check browser console** for errors (F12 → Console)
3. **Verify Next.js config** includes your image domain
4. **Test URL directly** in browser address bar

### 📋 **Debugging Checklist**

- [ ] URL is a direct image link (not a page)
- [ ] URL starts with `https://`
- [ ] Domain is in the supported list
- [ ] Image loads when opened directly in browser
- [ ] URL test shows all green checkmarks
- [ ] No console errors in browser

### 🆘 **Still Having Issues?**

1. Visit `/debug/images` and test your URL
2. Check the recommendations provided
3. Try a different image hosting service
4. Use a placeholder URL for testing: `https://via.placeholder.com/400x300`

### 💡 **Pro Tips**

- **Use ImgBB**: Upload to ImgBB and get the direct link
- **Test first**: Always test URLs in `/debug/images` before using
- **Keep URLs simple**: Avoid URLs with special characters or parameters
- **Use HTTPS**: Only secure URLs work with Next.js Image component
