'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useSpace, useConfirmDimensions } from '@/hooks/use-spaces'
import Link from 'next/link'

const ROOM_TYPE_LABELS: Record<string, string> = {
  living_room: 'Phòng khách', bedroom: 'Phòng ngủ', kitchen: 'Nhà bếp',
  dining_room: 'Phòng ăn', bathroom: 'Phòng tắm', office: 'Văn phòng', other: 'Không gian khác',
}

type DimensionsForm = { width: string; length: string; height: string }

export default function SpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: space, isLoading } = useSpace(id)
  const confirmDimensions = useConfirmDimensions(id)

  const { register, handleSubmit, formState: { errors } } = useForm<DimensionsForm>({
    values: space?.dimensions
      ? { width: String(space.dimensions.width), length: String(space.dimensions.length), height: String(space.dimensions.height) }
      : undefined,
  })

  const onConfirm = async (data: any) => {
    await confirmDimensions.mutateAsync({
      width: Number(data.width),
      length: Number(data.length),
      height: Number(data.height),
    })
    router.push(`/spaces/${id}/concept`)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!space) return <div className="py-32 text-center text-sm text-gray-500">Không tìm thấy không gian</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/spaces" className="text-gray-400 hover:text-gray-600 text-sm">← Không gian</Link>
        <span className="text-gray-200">/</span>
        <span className="text-sm text-gray-900 font-medium">{space.name}</span>
      </div>

      {/* Analyzing state */}
      {space.status === 'analyzing' && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center mb-6">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-blue-700">AI đang phân tích không gian...</p>
          <p className="text-xs text-blue-500 mt-1">Thường mất 5–15 giây</p>
        </div>
      )}

      {/* Photo strip */}
      {space.photoUrls?.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {space.photoUrls.map((key: string, i: number) => (
            <img
              key={i}
              src={`/api/photo?key=${encodeURIComponent(key)}`}
              alt={`Ảnh ${i + 1}`}
              className="h-24 w-36 object-cover rounded-xl flex-shrink-0 bg-gray-100"
            />
          ))}
        </div>
      )}

      {/* Analysis result */}
      {space.analysisResult && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Kết quả phân tích AI</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Loại phòng</p>
              <p className="text-sm font-medium text-gray-900">
                {ROOM_TYPE_LABELS[space.analysisResult.roomType] || 'Khác'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Phong cách hiện tại</p>
              <p className="text-sm font-medium text-gray-900">{space.analysisResult.currentStyle}</p>
            </div>
          </div>

          {space.analysisResult.existingFurniture?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">Đồ nội thất phát hiện được</p>
              <div className="flex flex-wrap gap-1.5">
                {space.analysisResult.existingFurniture.map((item: string, i: number) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item}</span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
            <p className="text-xs text-amber-700">{space.analysisResult.description}</p>
          </div>

          {space.analysisResult.confidence < 0.5 && (
            <p className="text-xs text-orange-500 mt-3">
              ⚠ Ảnh chưa đủ rõ — kích thước bên dưới là ước tính, vui lòng kiểm tra lại
            </p>
          )}
        </div>
      )}

      {/* Dimensions form */}
      {(space.status === 'ready' || space.status === 'error') && (
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Xác nhận kích thước phòng</h2>
          <p className="text-xs text-gray-400 mb-5">
            {space.analysisResult
              ? 'AI đã ước tính kích thước bên dưới. Chỉnh lại nếu cần.'
              : 'Nhập kích thước phòng của bạn.'}
          </p>

          <form onSubmit={handleSubmit(onConfirm)} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {(['width', 'length', 'height'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 mb-1">
                    {field === 'width' ? 'Chiều rộng' : field === 'length' ? 'Chiều dài' : 'Chiều cao'} (m)
                  </label>
                  <input
                    {...register(field)}
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  {errors[field] && <p className="text-xs text-red-500 mt-0.5">{errors[field]?.message}</p>}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={confirmDimensions.isPending}
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {confirmDimensions.isPending ? 'Đang lưu...' : 'Xác nhận và chọn phong cách →'}
            </button>
          </form>
        </div>
      )}

      {/* Pending state */}
      {space.status === 'pending' && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-500">Chưa có ảnh. Quay lại và upload ảnh phòng.</p>
          <Link href="/spaces" className="inline-block mt-3 text-sm text-gray-900 underline">
            Quay lại
          </Link>
        </div>
      )}
    </div>
  )
}
