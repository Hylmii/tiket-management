'use client'

import { useState, useEffect } from 'react'

export function AdminTestPanel() {
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const results: Record<string, any> = {}

    try {
      // Test 1: Admin transaction detail API
      const transactionResponse = await fetch('/api/admin/transactions')
      results.transactionList = {
        status: transactionResponse.status,
        ok: transactionResponse.ok,
        data: transactionResponse.ok ? await transactionResponse.json() : null
      }

      // Test 2: File upload endpoint
      const uploadFormData = new FormData()
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      uploadFormData.append('file', testFile)
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })
      results.fileUpload = {
        status: uploadResponse.status,
        ok: uploadResponse.ok,
        data: uploadResponse.ok ? await uploadResponse.json() : null
      }

      // Test 3: Check if uploads directory is accessible
      const uploadsResponse = await fetch('/uploads/placeholder-payment.svg')
      results.uploadsAccess = {
        status: uploadsResponse.status,
        ok: uploadsResponse.ok
      }

    } catch (error) {
      results.error = error
    }

    setTestResults(results)
    setLoading(false)
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Admin Function Tests</h3>
      
      <button
        onClick={runTests}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
      >
        {loading ? 'Running Tests...' : 'Run Tests'}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Test Results:</h4>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
