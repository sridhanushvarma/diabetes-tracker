import { useEffect, useState } from 'react';

/** Thin gradient bar at the top of the viewport that tracks scroll depth. */
export default function ScrollProgress() {
  const [scaleX, setScaleX] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setScaleX(max > 0 ? el.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      className="scroll-progress w-full"
      style={{ transform: `scaleX(${scaleX})` }}
      aria-hidden="true"
    />
  );
}
