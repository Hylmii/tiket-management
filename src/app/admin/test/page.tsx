import { Suspense } from 'react'
import { AdminTestPanel } from '@/components/admin/test-panel'

export default function AdminTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Admin Function Tests
        </h1>
        
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <AdminTestPanel />
        </Suspense>
      </div>
    </div>
  )
}
