'use client'
import Image from 'next/image'
import { useState } from 'react'

export default function ImageTestPage() {
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
    'https://via.placeholder.com/300x200/blue/white?text=Test+1',
    'https://picsum.photos/300/200',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop'
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">🖼️ Image Debug Tool</h1>
        
        {/* URL Input */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => testImageUrl(imageUrl)}
              disabled={!imageUrl.trim() || testing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-700">
              <strong>For ImgBB:</strong> Use direct URLs like <code className="bg-blue-100 px-1 rounded">https://i.ibb.co/abc123/image.jpg</code><br/>
              <strong>Not page URLs like:</strong> <code className="bg-red-100 px-1 rounded">https://ibb.co/b5wCQRhp</code>
            </p>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">URL Test Results:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <span className="font-medium mr-2">Valid URL:</span> 
                <span className={testResults.isValidUrl ? 'text-green-600' : 'text-red-600'}>
                  {testResults.isValidUrl ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Accessible:</span> 
                <span className={testResults.isAccessible ? 'text-green-600' : 'text-red-600'}>
                  {testResults.isAccessible ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Direct Image:</span> 
                <span className={testResults.isDirectImage ? 'text-green-600' : 'text-red-600'}>
                  {testResults.isDirectImage ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Content Type:</span> 
                <span className="text-blue-600">{testResults.contentType || 'Unknown'}</span>
              </div>
            </div>
            
            {testResults.recommendations && testResults.recommendations.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <h4 className="font-medium text-red-800 mb-2">Issues & Recommendations:</h4>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {testResults.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Test Image Preview */}
        {imageUrl && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Live Preview:</h3>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
              {imageError ? (
                <div className="text-red-600 text-center py-8">
                  <p className="text-xl mb-2">❌ Error loading image</p>
                  <p className="text-sm text-gray-600">{imageError}</p>
                </div>
              ) : imageLoaded ? (
                <div className="text-green-600 text-center mb-4">
                  <p className="text-xl">✅ Image loaded successfully!</p>
                </div>
              ) : (
                <div className="text-blue-600 text-center py-4">
                  <p className="text-xl">🔄 Loading image...</p>
                </div>
              )}
              
              <div className="flex justify-center">
                <Image
                  src={imageUrl}
                  alt="Test image preview"
                  width={400}
                  height={300}
                  className="border border-gray-300 rounded-lg max-w-full h-auto"
                  onLoad={() => {
                    setImageLoaded(true)
                    setImageError('')
                  }}
                  onError={(e) => {
                    setImageError(`Failed to load: ${imageUrl}`)
                    setImageLoaded(false)
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Working Examples */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">✅ Working Examples:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testUrls.map((url, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-2 break-all">{url}</p>
                <Image
                  src={url}
                  alt={`Working example ${index + 1}`}
                  width={200}
                  height={150}
                  className="border border-gray-300 rounded w-full h-auto"
                  onError={() => console.log(`Failed to load example: ${url}`)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-3">📋 How to fix your image URLs:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-green-700">
            <div>
              <h5 className="font-medium mb-2">For ImgBB:</h5>
              <ol className="list-decimal list-inside space-y-1">
                <li>Upload your image to ImgBB</li>
                <li>Look for "Direct link" option</li>
                <li>Copy URL starting with <code className="bg-green-100 px-1 rounded">https://i.ibb.co/</code></li>
                <li>URL should end with file extension (.jpg, .png)</li>
              </ol>
            </div>
            <div>
              <h5 className="font-medium mb-2">For Unsplash:</h5>
              <ol className="list-decimal list-inside space-y-1">
                <li>Right-click on image → "Copy image address"</li>
                <li>URL should start with <code className="bg-green-100 px-1 rounded">https://images.unsplash.com/</code></li>
                <li>Add size parameters: <code className="bg-green-100 px-1 rounded">?w=800&h=600</code></li>
                <li>Avoid page URLs with /photos/ in them</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
