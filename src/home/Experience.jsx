import { Text3D, Center, Environment } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

export default function Experience() {
  const isMouseActive = useRef(false);
  const canvasRef = useRef();
  /* ---------------- MOUSE PARALLAX (DESKTOP) ---------------- */
  useEffect(() => {
    // Find the canvas element
    const canvas = document.querySelector('canvas');
    canvasRef.current = canvas;
    function handleMouseMove(e) {
      if (!isMouseActive.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      parallax.current.x = x;
      parallax.current.y = y;
    }
    function handleMouseEnter() {
      isMouseActive.current = true;
    }
    function handleMouseLeave() {
      isMouseActive.current = false;
    }
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseenter', handleMouseEnter);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseenter', handleMouseEnter);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);
  const rotatingLight = useRef();
  const { camera } = useThree();

  const parallax = useRef({ x: 0, y: 0 });
  const lastTouch = useRef(null);

  /* ---------------- MOBILE ORIENTATION ---------------- */
  useEffect(() => {
    function handleOrientation(e) {
      if (e.gamma == null || e.beta == null) return;
      parallax.current.x = Math.max(-1, Math.min(1, e.gamma / 45));
      parallax.current.y = Math.max(-1, Math.min(1, e.beta / 45));
    }
    window.addEventListener('deviceorientation', handleOrientation);
    return () =>
      window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  /* ---------------- TOUCH FALLBACK ---------------- */
  useEffect(() => {
    function onTouchStart(e) {
      lastTouch.current = e.touches[0];
    }
    function onTouchMove(e) {
      if (!lastTouch.current) return;
      const t = e.touches[0];
      const dx = t.clientX - lastTouch.current.clientX;
      const dy = t.clientY - lastTouch.current.clientY;
      parallax.current.x = Math.max(
        -1,
        Math.min(1, parallax.current.x + dx / 300),
      );
      parallax.current.y = Math.max(
        -1,
        Math.min(1, parallax.current.y - dy / 300),
      );
      lastTouch.current = t;
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  /* ---------------- ANIMATION ---------------- */
  useFrame(() => {
    camera.position.set(0, 2, 12);
    camera.lookAt(0, 0, 0);

    // Calculate bounds of the BOOP text
    const textSize = 1.8;
    const letterSpacing = 0.12;
    const numLetters = 4; // B O O P
    // Each letter is roughly textSize wide, plus letterSpacing between each
    const totalWidth = numLetters * textSize + (numLetters - 1) * letterSpacing;
    const halfWidth = totalWidth / 2;

    // Calculate desired x position
    const amplitude = halfWidth; // max left/right is edge of text
    let x = parallax.current.x * amplitude;
    // Clamp to bounds
    x = Math.max(-halfWidth, Math.min(halfWidth, x));

    if (rotatingLight.current) {
      rotatingLight.current.position.x = x;
    }
  });

  return (
    <>
      {/* Soft baseline light for mobile screens */}
      <ambientLight intensity={0.35} />

      {/* Key light */}
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />

      {/* Interactive fill light */}
      <directionalLight
        ref={rotatingLight}
        position={[0, 2, 10]}
        intensity={1}
      />

      {/* Needed for metallic readability */}
      <Environment preset="night" />

      <Center position-z={-5}>
        <Text3D
          font="./fonts/Lard_Regular.json"
          size={1.8}
          height={0.35}
          curveSegments={10}
          bevelEnabled
          bevelThickness={0.15}
          bevelSize={0.06}
          letterSpacing={0.12}
          castShadow
          onClick={() => {
            window.open('https://forms.gle/jUPqpNrMSXhyM8Zt9', '_blank');
          }}
          style={{ cursor: 'pointer' }}
        >
          BOOP
          <meshStandardMaterial
            color="#e1adf7"
            metalness={0.9}
            roughness={0.2}
          />
        </Text3D>
      </Center>
    </>
  );
}
