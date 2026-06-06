export type PackageStatus = 'pending' | 'paid' | 'refunded'

export type FileCategory = 'video' | 'document' | 'image' | 'other'

export interface Package {
  id: string
}

export interface PackageFile {
  id: string
  category: FileCategory
}

export interface PackagePurchase {
  id: string
  status: PackageStatus
}

// TODO: Expand package types once database types are generated.
