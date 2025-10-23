

interface InvoicelyLogoProps {
  className?: string
  width?: number
  height?: number
  color?: 'white' | 'blue' | 'dark' | 'original'
}

export default function InvoicelyLogo({ 
  className = "", 
  width = 120, 
  height = 40,
  color = 'white'
}: InvoicelyLogoProps) {
  
  // Color filter configurations
  const getColorFilter = (colorType: string) => {
    switch (colorType) {
      case 'white':
        return 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)'
      case 'blue':
        return 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'
      case 'dark':
        return 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)'
      case 'original':
      default:
        return 'none'
    }
  }
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Logo failed to load from your SVG file')
    const img = e.currentTarget
    
    // Try fallback images in order
    if (img.src.includes('Generated-Image')) {
      img.src = '/invoicely-logo.png'  // Fallback to PNG if available
    } else if (img.src.includes('invoicely-logo.png')) {
      img.src = '/placeholder-logo.svg'
    }
  }

  return (
    <img 
      src="/Generated-Image-October-23_-2025-3_33AM.svg" 
      alt="Invoicely Logo" 
      className={`object-contain ${className}`}
      width={width}
      height={height}
      style={{
        backgroundColor: 'transparent',
        mixBlendMode: 'normal',
        filter: getColorFilter(color)
      }}
      onError={handleImageError}
      onLoad={() => {
        console.log('✅ Logo loaded successfully from your updated SVG file')
      }}
    />
  )
}