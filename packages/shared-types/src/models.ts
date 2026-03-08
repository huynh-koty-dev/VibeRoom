import { AssetCategory, ConceptId, RoomType, SpaceStatus, SubscriptionTier, UserRole } from './enums'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
}

export interface Dimensions {
  width: number   // meters
  length: number  // meters
  height: number  // meters
}

export interface RoomAnalysisResult {
  roomType: RoomType
  estimatedDimensions: Dimensions
  existingFurniture: string[]
  lightingDirection: 'north' | 'south' | 'east' | 'west' | 'unknown'
  currentStyle: string
  colorPalette: string[]
  description: string
  confidence: number
}

export interface Space {
  id: string
  userId: string
  name: string
  photoUrls: string[]
  dimensions?: Dimensions
  analysisResult?: RoomAnalysisResult
  conceptId?: ConceptId
  status: SpaceStatus
  createdAt: string
  updatedAt: string
}

export interface ConceptEnvironment {
  wallColor: string
  floorColor: string
  ceilingColor: string
  ambientLightIntensity: number
  ambientLightColor: string
  directionalLightIntensity: number
}

export interface Concept {
  id: ConceptId
  nameVi: string
  nameEn: string
  description: string
  tags: string[]
  coverImageUrl: string
  moodBoardUrls: string[]
  colorPalette: string[]
  environment: ConceptEnvironment
}

export interface Asset {
  id: string
  companyId?: string
  name: string
  category: AssetCategory
  conceptIds: ConceptId[]
  tags: string[]
  glbUrl: string
  thumbnailUrl: string
  dimensions: Dimensions
  priceRange?: string
  contactInfo?: string
  isActive: boolean
  viewCount: number
  createdAt: string
}

export interface FurniturePlacement {
  id: string
  assetId: string
  position: { x: number; y: number; z: number }
  rotation: number  // degrees, Y axis
}

export interface Design {
  id: string
  spaceId: string
  userId: string
  conceptId: ConceptId
  placements: FurniturePlacement[]
  savedAt: string
}

export interface Company {
  id: string
  name: string
  email: string
  phone?: string
  website?: string
  address?: string
  logoUrl?: string
  description?: string
  subscriptionTier: SubscriptionTier
  isActive: boolean
  createdAt: string
}

export interface Lead {
  id: string
  userId: string
  assetId: string
  companyId: string
  spaceId: string
  contactedAt: string
}
