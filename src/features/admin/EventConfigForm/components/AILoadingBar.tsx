type AILoadingBarProps = {
  visible: boolean;
};

/**
 * Fullwidth animated gradient bar fixed at the bottom of the viewport.
 * Appears while an AI suggestion request is in flight.
 */
const AILoadingBar = ({ visible }: AILoadingBarProps) => (
  <div
    className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 h-10 overflow-hidden transition-all duration-500 blur-2xl"
    style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'scaleY(1)' : 'scaleY(0)',
    }}
    aria-hidden
  >
    <div
      className="h-full w-full animate-ai-shimmer"
      style={{
        background:
          'linear-gradient(90deg, #4f8ef7, #a855f7, #06b6d4, #10b981, #f59e0b, #ec4899, #4f8ef7)',
        backgroundSize: '300% 300%',
        transform: 'scaleY(2)',
        transformOrigin: 'bottom',
      }}
    />
  </div>
);

export default AILoadingBar;
