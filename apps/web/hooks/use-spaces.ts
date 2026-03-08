'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

const apiUrl = process.env.NEXT_PUBLIC_API_URL

async function authFetch(url: string, token: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options?.headers },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Lỗi server')
  return json.data
}

export function useSpaces() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ['spaces'],
    queryFn: () => authFetch(`${apiUrl}/spaces`, session!.accessToken),
    enabled: !!session?.accessToken,
  })
}

export function useSpace(id: string) {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ['spaces', id],
    queryFn: () => authFetch(`${apiUrl}/spaces/${id}`, session!.accessToken),
    enabled: !!session?.accessToken && !!id,
    refetchInterval: (query) => {
      // Poll every 2s while analyzing
      return query.state.data?.status === 'analyzing' ? 2000 : false
    },
  })
}

export function useCreateSpace() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) =>
      authFetch(`${apiUrl}/spaces`, session!.accessToken, {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spaces'] }),
  })
}

export function useUploadPhotos(spaceId: string) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (files: File[]) => {
      // 1. Upload files qua NestJS → NestJS tự upload lên R2 (tránh CORS)
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))

      const uploadRes = await fetch(`${apiUrl}/storage/upload/photos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session!.accessToken}` },
        body: formData,
      })
      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        throw new Error(err.message || 'Upload ảnh thất bại')
      }
      const { data } = await uploadRes.json()

      // 2. Gửi keys → trigger AI analysis
      return authFetch(`${apiUrl}/spaces/${spaceId}/photos`, session!.accessToken, {
        method: 'POST',
        body: JSON.stringify({ photoUrls: data.keys }),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spaces', spaceId] }),
  })
}

export function useConfirmDimensions(spaceId: string) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dimensions: { width: number; length: number; height: number }) =>
      authFetch(`${apiUrl}/spaces/${spaceId}/dimensions`, session!.accessToken, {
        method: 'PATCH',
        body: JSON.stringify({ dimensions }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spaces', spaceId] }),
  })
}

export function useDeleteSpace() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`${apiUrl}/spaces/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session!.accessToken}` },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spaces'] }),
  })
}
