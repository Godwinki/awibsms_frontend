'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import CompanyService from '@/lib/services/company/company.service'
import Image from 'next/image'

interface CompanyLogoUploadProps {
  currentLogo?: string | null
  onLogoUpdate: () => void
}

export function CompanyLogoUpload({ currentLogo, onLogoUpdate }: CompanyLogoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      const result = await CompanyService.uploadLogo(file)

      if (result.success) {
        toast({
          title: "Success",
          description: "Logo uploaded successfully",
        })
        onLogoUpdate()
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error: any) {
      console.error('Failed to upload logo:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveLogo = async () => {
    if (!currentLogo) return

    try {
      setRemoving(true)
      const result = await CompanyService.removeLogo()

      if (result.success) {
        toast({
          title: "Success",
          description: "Logo removed successfully",
        })
        onLogoUpdate()
      } else {
        throw new Error(result.message || 'Remove failed')
      }
    } catch (error: any) {
      console.error('Failed to remove logo:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove logo",
        variant: "destructive",
      })
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Logo Display */}
      <div className="flex items-center justify-center">
        {currentLogo ? (
          <div className="relative group">
            <div className="w-32 h-32 relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              <Image
                src={currentLogo}
                alt="Company Logo"
                fill
                className="object-contain"
                sizes="128px"
              />
            </div>
            {/* Remove button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRemoveLogo}
                disabled={removing}
                className="text-xs"
              >
                {removing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No logo</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex gap-2 justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {currentLogo ? 'Change Logo' : 'Upload Logo'}
              </>
            )}
          </Button>

          {currentLogo && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveLogo}
              disabled={removing}
            >
              {removing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Recommended: 400x400px, max 5MB
          </p>
          <p className="text-xs text-muted-foreground">
            Supports: JPG, PNG, GIF, WebP
          </p>
        </div>
      </div>
    </div>
  )
}
