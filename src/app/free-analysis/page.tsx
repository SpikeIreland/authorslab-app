'use client'

import { useState, FormEvent, ChangeEvent, DragEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FreeAnalysisPage() {
  const [file, setFile] = useState<File | null>(null)
  const [wordCount, setWordCount] = useState<string>('')
  const [wordCountFormatted, setWordCountFormatted] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string>('')
  const [dragOver, setDragOver] = useState(false)

  const WEBHOOK_URL = "https://spikeislandstudios.app.n8n.cloud/webhook/free-manuscript-analysis"
  const WORD_COUNT_URL = "https://spikeislandstudios.app.n8n.cloud/webhook/manuscript-word-count"

  const validateFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const fileName = file.name.toLowerCase()
    
    if (!fileName.endsWith('.pdf') && file.type !== 'application/pdf') {
      return { valid: false, error: 'Only PDF files are accepted.' }
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB.' }
    }
    
    return { valid: true }
  }

  const getAccurateWordCount = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('manuscript', file)
      formData.append('phaseType', 'developmental_editing')
      
      const response = await fetch(WORD_COUNT_URL, {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        return {
          success: true,
          wordCount: result.wordCount,
          formattedWordCount: result.formattedWordCount,
          quality: result.extractionQuality
        }
      } else {
        throw new Error('Word count service unavailable')
      }
    } catch (error) {
      // Fallback to estimation
      return {
        success: false,
        wordCount: Math.round(file.size / 6),
        formattedWordCount: Math.round(file.size / 6).toLocaleString() + ' (estimated)',
        quality: 'estimated'
      }
    }
  }

  const handleFileSelection = async (selectedFile: File) => {
    setError('')
    setFile(null)
    setWordCount('')
    setWordCountFormatted('')
    
    const validation = validateFile(selectedFile)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setFile(selectedFile)
    setIsAnalyzing(true)
    
    const wordCountResult = await getAccurateWordCount(selectedFile)
    
    setWordCount(wordCountResult.wordCount.toString())
    setWordCountFormatted(wordCountResult.formattedWordCount)
    setIsAnalyzing(false)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a PDF file to upload.')
      return
    }

    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    formData.set('manuscript0', file)
    formData.set('fileType', 'pdf')
    formData.set('originalFileName', file.name)
    formData.set('fileSizeBytes', file.size.toString())
    formData.set('submissionDate', new Date().toISOString())
    formData.set('wordCount', wordCount)

    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData
      })
      
      setTimeout(() => {
        setIsSubmitting(false)
        setIsSuccess(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 2000)
    } catch (error) {
      setTimeout(() => {
        setIsSubmitting(false)
        setIsSuccess(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 2000)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <nav className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              📚 AuthorsLab.ai
            </Link>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto">
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-6">✅</div>
              <h1 className="text-4xl font-bold text-green-900 mb-4">
                Complete Manuscript Analysis Submitted!
              </h1>
              <p className="text-xl text-green-800 mb-4">
                <strong>Thank you!</strong> Your full manuscript has been successfully submitted for analysis.
              </p>
              <p className="text-lg text-green-800 mb-6">
                You&apos;ll receive your <strong>comprehensive overview report</strong> via email within <strong>15 minutes</strong>.
              </p>
              <div className="bg-blue-100 rounded-xl p-6 mb-8">
                <p className="text-blue-900">
                  <strong>📧 Check your email soon!</strong><br />
                  Your report will include insights that demonstrate our complete analysis capabilities.
                </p>
              </div>
              <Link href="/">
                <Button className="text-lg px-8 py-6">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <nav className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              📚 AuthorsLab.ai
            </Link>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border-2 border-green-500 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-6">📄</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Analyzing Your Complete Manuscript
              </h2>
              <p className="text-xl text-gray-700">
                Our AI is performing a comprehensive analysis of your manuscript... You&apos;ll receive your professional overview report via email shortly!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              📚 AuthorsLab.ai
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/how-it-works" className="text-gray-700 hover:text-blue-900 font-semibold">
                How It Works
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-900 font-semibold">
                Pricing
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block mb-6">
            <span className="px-6 py-3 bg-white/20 border-2 border-white rounded-full text-lg font-bold">
              🎉 100% FREE • FULL MANUSCRIPT ANALYSIS
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            Free Manuscript Analysis
          </h1>
          <p className="text-2xl opacity-95">
            Get professional AI analysis of your complete manuscript in minutes
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Breakthrough Notice */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-4 border-yellow-400 rounded-2xl p-8 mb-8 text-center relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl">
              🚀
            </div>
            <h2 className="text-3xl font-bold text-yellow-900 mb-4 mt-4">
              BREAKTHROUGH: Full Manuscript Analysis Now FREE!
            </h2>
            <p className="text-xl text-yellow-800 mb-4">
              Experience our complete AI analysis technology with your entire manuscript.
            </p>
            <div className="bg-yellow-200 rounded-lg p-4 font-bold text-yellow-900">
              No more 2,000-word limits • No credit card required • Professional insights in minutes
            </div>
          </div>

          {/* What You'll Receive */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-green-500 mb-8">
            <h3 className="text-2xl font-bold text-green-900 mb-4">What You&apos;ll Receive (Free!):</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <span><strong>Complete manuscript overview</strong> - Overall strengths and development opportunities</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <span><strong>Key structural insights</strong> - Pacing, organization, and narrative flow</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <span><strong>Character development overview</strong> - Protagonist journey and supporting character effectiveness</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <span><strong>Thematic depth assessment</strong> - Core themes and their development</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <span><strong>Professional priority recommendations</strong> - Next steps for improvement</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">✓</span>
                <span><strong>Detailed PDF report</strong> via email within 15 minutes</span>
              </li>
            </ul>
          </div>

          {/* Upgrade CTA */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-8 mb-8 text-center">
            <h3 className="text-2xl font-bold mb-4">🎯 Want Chapter-by-Chapter Detail?</h3>
            <p className="text-lg mb-6">
              This free analysis provides a comprehensive overview. For detailed, actionable chapter-by-chapter feedback, scene-specific suggestions, and a complete revision roadmap:
            </p>
            <Link href="/pricing">
              <Button className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-6">
                Upgrade to Complete Author Package - $399
              </Button>
            </Link>
          </div>

          {/* PDF Notice */}
          <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-6 mb-8 text-center">
            <h4 className="text-xl font-bold text-blue-900 mb-2">📄 PDF Format Required</h4>
            <p className="text-blue-800 mb-2">
              We accept <strong>PDF files only</strong> for streamlined processing and comprehensive analysis quality.
            </p>
            <p className="text-blue-700 text-sm">
              <em>Need to convert? Most word processors can save/export as PDF.</em>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg">
            {error && (
              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 mb-6 text-red-900">
                ❌ {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="authorName" className="block text-lg font-bold text-gray-900 mb-2">
                  Author Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="authorName"
                  name="authorName"
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg"
                />
              </div>

              <div>
                <label htmlFor="bookTitle" className="block text-lg font-bold text-gray-900 mb-2">
                  Book/Manuscript Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="bookTitle"
                  name="bookTitle"
                  required
                  placeholder="Enter your book title"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg"
                />
              </div>

              <div>
                <label htmlFor="authorEmail" className="block text-lg font-bold text-gray-900 mb-2">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="authorEmail"
                  name="authorEmail"
                  required
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg"
                />
              </div>

              <div>
                <label htmlFor="genre" className="block text-lg font-bold text-gray-900 mb-2">
                  Genre (Optional)
                </label>
                <input
                  type="text"
                  id="genre"
                  name="genre"
                  placeholder="e.g., Literary Fiction, Romance, Mystery"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg"
                />
              </div>

              <div>
                <label htmlFor="additionalNotes" className="block text-lg font-bold text-gray-900 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  rows={4}
                  placeholder="Any specific areas you'd like us to focus on..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-2">
                  Upload Complete Manuscript PDF <span className="text-red-600">*</span>
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all ${
                    dragOver 
                      ? 'border-green-600 bg-green-50' 
                      : file 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50/50'
                  }`}
                >
                  <div className="text-6xl mb-4">📄</div>
                  <div className="text-xl font-bold text-gray-900 mb-2">
                    Choose Your Complete Manuscript
                  </div>
                  <div className="text-gray-600 mb-6">
                    Drag and drop your PDF here, or click to browse<br />
                    <strong>Full manuscript analysis - no word limits!</strong>
                  </div>
                  
                  <input
                    type="file"
                    id="manuscript"
                    name="manuscript0"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => document.getElementById('manuscript')?.click()}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all"
                  >
                    Select PDF File
                  </button>

                  {file && (
                    <div className="mt-6 p-4 bg-green-100 rounded-lg">
                      <div className="font-bold text-green-900 mb-2">
                        ✅ PDF Selected: {file.name}
                      </div>
                      {isAnalyzing ? (
                        <div className="text-green-700">⏳ Analyzing manuscript...</div>
                      ) : wordCountFormatted ? (
                        <div className="text-green-800">
                          <strong>Manuscript Word Count:</strong> {wordCountFormatted} words<br />
                          <span className="text-sm">✅ Complete manuscript ready for analysis!</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                  <strong>Required format:</strong> PDF files only (.pdf)<br />
                  <strong>Maximum size:</strong> 10MB<br />
                  <strong>Full manuscript analysis:</strong> We analyze your complete manuscript, regardless of length<br />
                  <strong>Convert to PDF:</strong> Most word processors have a &quot;Save as PDF&quot; or &quot;Export as PDF&quot; option<br />
                  <strong>Best quality:</strong> Ensure your PDF contains selectable text (not scanned images)<br />
                  <strong>⭐ No word limits:</strong> Upload your entire manuscript for comprehensive analysis
                </div>
              </div>

              <Button
                type="submit"
                disabled={!file || isAnalyzing}
                className="w-full text-xl py-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {isAnalyzing ? 'Analyzing File...' : 'Get Complete Free Analysis'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}