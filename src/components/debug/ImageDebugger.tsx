'use client'
import Image from 'next/image'
import { useState } from 'react'

export default function ImageDebugger() {
  const [imageUrl, setImageUrl] = useState('')
  const [imageError, setImageError] = useState('')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)

  const testImageUrl = async (url: string) => {
    if (!url.trim()) return
    
    setTesting(true)
    setTestResults(null)
    
    try {
      const response = await fetch('/api/debug/test-image-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url })
      })
      
      const results = await response.json()
      setTestResults(results)
    } catch (error) {
      console.error('Test failed:', error)
      setTestResults({ error: 'Test failed', recommendations: ['Unable to test URL'] })
    } finally {
      setTesting(false)
    }
  }

  const testUrls = [
    'https://i.ibb.co/sample/test.jpg', // Replace with actual ImgBB direct URL
    'https://via.placeholder.com/300x200',
    'https://picsum.photos/300/200',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200'
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Image Loading Debug Tool</h1>
      
      {/* URL Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Test Image URL:
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value)
            setTestResults(null)
            setImageError('')
            setImageLoaded(false)
          }}
          placeholder="https://i.ibb.co/your-image-url"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => testImageUrl(imageUrl)}
            disabled={!imageUrl.trim() || testing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test URL'}
          </button>
          <button
            onClick={() => {
              setImageUrl('')
              setTestResults(null)
              setImageError('')
              setImageLoaded(false)
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          For ImgBB: Use the direct image URL (i.ibb.co), not the page URL (ibb.co)
        </p>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">URL Test Results:</h3>
          <div className="border border-gray-200 p-4 rounded bg-gray-50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Valid URL:</span> 
                <span className={testResults.isValidUrl ? 'text-green-600' : 'text-red-600'}>
                  {testResults.isValidUrl ? ' ✅ Yes' : ' ❌ No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Accessible:</span> 
                <span className={testResults.isAccessible ? 'text-green-600' : 'text-red-600'}>
                  {testResults.isAccessible ? ' ✅ Yes' : ' ❌ No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Direct Image:</span> 
                <span className={testResults.isDirectImage ? 'text-green-600' : 'text-red-600'}>
                  {testResults.isDirectImage ? ' ✅ Yes' : ' ❌ No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Content Type:</span> 
                <span className="text-blue-600"> {testResults.contentType || 'Unknown'}</span>
              </div>
            </div>
            
            {testResults.recommendations && testResults.recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-red-800 mb-2">Issues & Recommendations:</h4>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {testResults.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Image */}
      {imageUrl && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Test Result:</h3>
          <div className="border border-gray-200 p-4 rounded">
            {imageError ? (
              <div className="text-red-600">
                <p>❌ Error loading image:</p>
                <p className="text-sm">{imageError}</p>
              </div>
            ) : imageLoaded ? (
              <p className="text-green-600">✅ Image loaded successfully!</p>
            ) : (
              <p className="text-blue-600">🔄 Loading...</p>
            )}
            
            <div className="mt-4">
              <Image
                src={imageUrl}
                alt="Test image"
                width={300}
                height={200}
                onLoad={() => {
                  setImageLoaded(true)
                  setImageError('')
                }}
                onError={(e) => {
                  setImageError(`Failed to load image: ${imageUrl}`)
                  setImageLoaded(false)
                }}
                className="border border-gray-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Working Examples */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Working Image Examples:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testUrls.map((url, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded">
              <p className="text-sm text-gray-600 mb-2 truncate">{url}</p>
              <Image
                src={url}
                alt={`Test image ${index + 1}`}
                width={300}
                height={200}
                className="border border-gray-300"
                onError={() => console.log(`Failed to load: ${url}`)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ImgBB Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-semibold text-blue-800 mb-2">How to get ImgBB direct URLs:</h4>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Upload your image to ImgBB</li>
          <li>2. After upload, look for "Direct link" or "BBCode" options</li>
          <li>3. Copy the URL that starts with <code>https://i.ibb.co/</code></li>
          <li>4. The URL should end with the file extension (.jpg, .png, etc.)</li>
          <li>5. Example: <code>https://i.ibb.co/abc123/image.jpg</code></li>
        </ol>
        <p className="text-sm text-blue-600 mt-2">
          <strong>Note:</strong> Page URLs like <code>https://ibb.co/b5wCQRhp</code> won't work with Next.js Image component.
        </p>
      </div>
    </div>
  )
}
