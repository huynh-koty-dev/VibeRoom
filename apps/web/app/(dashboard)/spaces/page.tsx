'use client'

import { useState } from 'react'
import { useSpaces } from '@/hooks/use-spaces'
import { SpaceCard } from '@/components/spaces/space-card'
import { SpaceCreateModal } from '@/components/spaces/space-create-modal'

export default function SpacesPage() {
  const { data: spaces, isLoading } = useSpaces()
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Không gian của tôi</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý và thiết kế các không gian sống của bạn</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          + Thêm không gian
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl h-52 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && spaces?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Chưa có không gian nào</h3>
          <p className="text-sm text-gray-500 max-w-xs">Chụp ảnh phòng để AI phân tích và bắt đầu thiết kế</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Tạo không gian đầu tiên
          </button>
        </div>
      )}

      {!isLoading && spaces?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {spaces.map((space: any) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      )}

      <SpaceCreateModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
