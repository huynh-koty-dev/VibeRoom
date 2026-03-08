'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useDeleteSpace } from '@/hooks/use-spaces'

const ROOM_TYPE_LABELS: Record<string, string> = {
  living_room: 'Phòng khách', bedroom: 'Phòng ngủ', kitchen: 'Nhà bếp',
  dining_room: 'Phòng ăn', bathroom: 'Phòng tắm', office: 'Văn phòng', other: 'Khác',
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Chờ ảnh',      color: 'bg-gray-100 text-gray-500' },
  analyzing: { label: 'Đang phân tích', color: 'bg-blue-50 text-blue-600' },
  ready:     { label: 'Sẵn sàng',     color: 'bg-green-50 text-green-600' },
  error:     { label: 'Lỗi',          color: 'bg-red-50 text-red-500' },
}

interface SpaceCardProps {
  space: {
    id: string
    name: string
    status: string
    analysisResult?: { roomType: string; description: string }
    dimensions?: { width: number; length: number; height: number }
    photoUrls: string[]
  }
}

export function SpaceCard({ space }: SpaceCardProps) {
  const deleteMutation = useDeleteSpace()
  const status = STATUS_CONFIG[space.status] || STATUS_CONFIG.pending
  const [imgError, setImgError] = useState(false)

  const photoKey = space.photoUrls?.[0]
  const photoSrc = photoKey && !imgError ? `/api/photo?key=${encodeURIComponent(photoKey)}` : null

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-sm transition-shadow group">
      {/* Thumbnail area */}
      <div className="h-36 bg-gray-50 flex items-center justify-center relative">
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={space.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )}
        <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
          {space.status === 'analyzing' && (
            <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mr-1 animate-pulse" />
          )}
          {status.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 text-sm truncate">{space.name}</h3>

        {space.analysisResult && (
          <p className="text-xs text-gray-500 mt-0.5">
            {ROOM_TYPE_LABELS[space.analysisResult.roomType] || 'Phòng'}
            {space.dimensions && ` · ${space.dimensions.width}×${space.dimensions.length}m`}
          </p>
        )}

        {space.analysisResult?.description && (
          <p className="text-xs text-gray-400 mt-2 line-clamp-2">{space.analysisResult.description}</p>
        )}

        <div className="flex gap-2 mt-4">
          <Link href={`/spaces/${space.id}`}
            className="flex-1 text-center text-xs bg-gray-900 text-white py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
            Mở
          </Link>
          <button
            onClick={() => deleteMutation.mutate(space.id)}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-red-500 border border-gray-100 rounded-lg transition-colors">
            Xóa
          </button>
        </div>
      </div>
    </div>
  )
}
