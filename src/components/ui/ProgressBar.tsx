interface ProgressBarProps {
  progress: number; // 0-100
  duration?: number; // animation duration in seconds
}

export default function ProgressBar({
  progress,
  duration = 0.3,
}: ProgressBarProps) {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
      <span
        className="block h-2 rounded-full bg-blue-600"
        style={{
          width: `${progress}%`,
          transition: `width ${duration}s ease-in-out`,
        }}
      />
    </div>
  );
}
