'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateSpace, useUploadPhotos } from '@/hooks/use-spaces'

interface Props {
  open: boolean
  onClose: () => void
}

export function SpaceCreateModal({ open, onClose }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<'name' | 'photos' | 'uploading'>('name')
  const [name, setName] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [spaceId, setSpaceId] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createSpace = useCreateSpace()
  const uploadPhotos = useUploadPhotos(spaceId)

  const handleNameSubmit = async () => {
    if (!name.trim()) return setError('Vui lòng nhập tên không gian')
    setError('')
    const space = await createSpace.mutateAsync(name.trim())
    setSpaceId(space.id)
    setStep('photos')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 4)
    const valid = selected.filter((f) => f.type.startsWith('image/') && f.size < 10 * 1024 * 1024)
    setFiles(valid)
    setError(valid.length < selected.length ? 'Một số ảnh không hợp lệ (>10MB hoặc không phải ảnh)' : '')
  }

  const handleUpload = async () => {
    if (files.length === 0) return setError('Vui lòng chọn ít nhất 1 ảnh')
    setStep('uploading')
    setError('')
    try {
      await uploadPhotos.mutateAsync(files)
      onClose()
      router.push(`/spaces/${spaceId}`)
    } catch (err: any) {
      setError(err?.message || 'Upload thất bại, vui lòng thử lại')
      setStep('photos')
    }
  }

  const handleClose = () => {
    setStep('name'); setName(''); setFiles([]); setError(''); setSpaceId('')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {step === 'name' ? 'Đặt tên không gian' : step === 'photos' ? 'Chụp ảnh phòng' : 'Đang tải lên...'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        </div>

        <div className="p-6">
          {/* Step 1: Name */}
          {step === 'name' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Ví dụ: Phòng khách, Phòng ngủ chính...</p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                placeholder="Tên không gian"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button onClick={handleNameSubmit} disabled={createSpace.isPending}
                className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
                {createSpace.isPending ? 'Đang tạo...' : 'Tiếp tục →'}
              </button>
            </div>
          )}

          {/* Step 2: Photos */}
          {step === 'photos' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Chụp 2–4 góc khác nhau để AI phân tích chính xác hơn. Tối đa 4 ảnh, mỗi ảnh &lt;10MB.
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                {files.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {files.map((file, i) => (
                      <div key={i} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-400">Click để chọn ảnh</p>
                    <p className="text-xs text-gray-300 mt-1">1–4 ảnh</p>
                  </div>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={handleFileChange} />

              {files.length > 0 && (
                <p className="text-xs text-gray-500 text-center">
                  Đã chọn {files.length} ảnh · <button className="underline" onClick={() => setFiles([])}>Xóa tất cả</button>
                </p>
              )}

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button onClick={handleUpload} disabled={files.length === 0}
                className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
                Tải lên và phân tích
              </button>
            </div>
          )}

          {/* Step 3: Uploading */}
          {step === 'uploading' && (
            <div className="text-center py-8 space-y-3">
              <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium text-gray-900">Đang tải ảnh lên...</p>
              <p className="text-xs text-gray-400">AI sẽ phân tích không gian sau khi tải xong</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
