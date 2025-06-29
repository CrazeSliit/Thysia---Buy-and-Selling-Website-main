import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { pageUrl } = await request.json()
    
    if (!pageUrl) {
      return NextResponse.json({ error: 'pageUrl is required' }, { status: 400 })
    }

    let directUrl = ''
    let suggestions = []

    // Handle Unsplash page URLs
    if (pageUrl.includes('unsplash.com/photos/')) {
      // Extract photo ID from URL
      const photoId = pageUrl.split('/photos/')[1]?.split('?')[0]?.split('#')[0]
      
      if (photoId) {
        // Create direct URL with common parameters
        directUrl = `https://images.unsplash.com/photo-${photoId}?w=800&h=600&fit=crop&auto=format&q=80`
        suggestions.push({
          type: 'Recommended',
          url: directUrl,
          description: 'Optimized for web use (800x600, cropped)'
        })
        
        // High resolution version
        suggestions.push({
          type: 'High Resolution',
          url: `https://images.unsplash.com/photo-${photoId}?w=1920&h=1080&fit=crop&auto=format&q=80`,
          description: 'High resolution version (1920x1080)'
        })
        
        // Square version
        suggestions.push({
          type: 'Square',
          url: `https://images.unsplash.com/photo-${photoId}?w=600&h=600&fit=crop&auto=format&q=80`,
          description: 'Square format (600x600)'
        })
      } else {
        return NextResponse.json({ 
          error: 'Could not extract photo ID from Unsplash URL',
          suggestions: [{
            type: 'Manual',
            description: 'Go to the Unsplash page, right-click the image, and select "Copy Image Address"'
          }]
        })
      }
    }
    
    // Handle ImgBB page URLs
    else if (pageUrl.includes('ibb.co/') && !pageUrl.includes('i.ibb.co/')) {
      const imageId = pageUrl.split('/').pop()
      suggestions.push({
        type: 'Manual Required',
        description: `Go to ${pageUrl}, right-click the image, and copy the direct URL`,
        note: 'ImgBB direct URLs cannot be generated automatically'
      })
    }
    
    // Handle other cases
    else if (pageUrl.startsWith('https://images.') || pageUrl.includes('i.ibb.co') || pageUrl.includes('via.placeholder.com')) {
      return NextResponse.json({
        message: 'This appears to be a direct image URL already',
        originalUrl: pageUrl,
        isDirectUrl: true
      })
    }
    
    else {
      return NextResponse.json({
        error: 'Unsupported URL format',
        supportedFormats: [
          'Unsplash: https://unsplash.com/photos/...',
          'ImgBB: https://ibb.co/...',
          'Direct image URLs'
        ]
      })
    }

    return NextResponse.json({
      originalUrl: pageUrl,
      directUrl,
      suggestions,
      instructions: 'Copy one of the suggested URLs and test it in the Image Debug tool'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to convert URL', details: error },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'URL Converter API',
    usage: 'POST with { "pageUrl": "your-page-url-here" }',
    supportedSites: ['Unsplash', 'ImgBB'],
    example: {
      input: 'https://unsplash.com/photos/example-photo-id',
      output: 'https://images.unsplash.com/photo-example-photo-id?w=800&h=600&fit=crop&auto=format&q=80'
    }
  })
}
