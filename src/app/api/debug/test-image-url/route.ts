import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
    }

    // Test if the URL is accessible
    const testResults = {
      url: imageUrl,
      isValidUrl: false,
      isAccessible: false,
      isDirectImage: false,
      contentType: '',
      fileSize: 0,
      recommendations: [] as string[]
    }

    // Check if it's a valid URL
    try {
      new URL(imageUrl)
      testResults.isValidUrl = true
    } catch {
      testResults.recommendations.push('URL format is invalid')
      return NextResponse.json(testResults)
    }

    // Test accessibility and content type
    try {
      const response = await fetch(imageUrl, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ImageTester/1.0)'
        }
      })
      
      testResults.isAccessible = response.ok
      testResults.contentType = response.headers.get('content-type') || ''
      testResults.fileSize = parseInt(response.headers.get('content-length') || '0')
      
      // Check if it's a direct image
      testResults.isDirectImage = testResults.contentType.startsWith('image/')
      
      if (!testResults.isAccessible) {
        testResults.recommendations.push('URL is not accessible (returns error)')
      }
      
      if (!testResults.isDirectImage) {
        testResults.recommendations.push('URL does not point to a direct image file')
        
        // Check for common image hosting patterns
        if (imageUrl.includes('ibb.co/') && !imageUrl.includes('i.ibb.co/')) {
          testResults.recommendations.push('For ImgBB: Use direct image URL starting with "i.ibb.co" instead of page URL')
        }
        
        if (imageUrl.includes('imgur.com/') && !imageUrl.includes('i.imgur.com/')) {
          testResults.recommendations.push('For Imgur: Use direct image URL starting with "i.imgur.com" instead of page URL')
        }
      }
      
    } catch (error) {
      testResults.recommendations.push(`Network error: ${error}`)
    }

    // Additional checks
    if (testResults.isValidUrl) {
      const url = new URL(imageUrl)
      
      // Check supported domains
      const supportedDomains = [
        'i.ibb.co', 'ibb.co', 'i.imgur.com', 'imgur.com',
        'images.unsplash.com', 'unsplash.com', 'res.cloudinary.com',
        'via.placeholder.com', 'picsum.photos'
      ]
      
      const isDomainSupported = supportedDomains.some(domain => url.hostname === domain)
      
      if (!isDomainSupported) {
        testResults.recommendations.push(`Domain "${url.hostname}" might not be configured in Next.js image optimization`)
      }
    }

    return NextResponse.json(testResults)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to test image URL', details: error },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Image URL Tester API',
    usage: 'POST with { "imageUrl": "your-url-here" }',
    supportedDomains: [
      'i.ibb.co', 'ibb.co', 'i.imgur.com', 'imgur.com',
      'images.unsplash.com', 'unsplash.com', 'res.cloudinary.com',
      'via.placeholder.com', 'picsum.photos'
    ]
  })
}
