interface ProgressBarProps {
  progress: number; // 0-100
  duration?: number; // animation duration in seconds
}

export default function ProgressBar({
  progress,
  duration = 0.3,
}: ProgressBarProps) {
  return (
    <div className='w-full bg-gray-200 rounded-full h-2 relative overflow-hidden'>
      <span
        className='bg-blue-600 h-2 rounded-full block'
        style={{
          width: `${progress}%`,
          transition: `width ${duration}s ease-in-out`,
        }}
      />
    </div>
  );
}
