interface VideoPlayerProps {
  src: string
  title?: string
  className?: string
}

export function VideoPlayer({ src, title, className = '' }: VideoPlayerProps) {
  return (
    <div className={className}>
      {title && (
        <h3 className="text-2xl font-heading font-bold text-center mb-6 text-gray-900 dark:text-white">
          {title}
        </h3>
      )}

      <div className="rounded-2xl overflow-hidden shadow-2xl">
        <video className="w-full h-auto" controls>
          <source src={src} type="video/mp4" />
        </video>
      </div>
    </div>
  )
}