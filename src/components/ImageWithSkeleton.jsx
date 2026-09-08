import { useState } from 'react'

export default function ImageWithSkeleton({ src, alt = '', aspect = 'aspect-[4/5]', className = '', ...props }) {
  const [loaded, setLoaded] = useState(false)
  return <div className={`relative overflow-hidden ${aspect} ${className}`}><div aria-hidden="true" className={`absolute inset-0 bg-neutral-900 ${loaded ? 'opacity-0' : 'animate-pulse opacity-100'} transition-opacity duration-500`} /><img {...props} src={src} alt={alt} onLoad={() => setLoaded(true)} onError={() => setLoaded(true)} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${loaded ? 'opacity-100' : 'opacity-0'}`} /></div>
}
