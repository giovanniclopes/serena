import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

interface iOSPointerProps {
  isVisible?: boolean;
}

export default function iOSPointer({ isVisible = true }: iOSPointerProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 500, damping: 100 });
  const springY = useSpring(mouseY, { stiffness: 500, damping: 100 });

  const rotate = useTransform(springX, [-100, 100], [-15, 15]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    if (isVisible) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mouseenter", handleMouseEnter);
      document.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        x: springX,
        y: springY,
        scale: isClicking ? 0.7 : isHovering ? 1.1 : 1,
        rotate: isClicking ? rotate : 0,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: isClicking ? 0.7 : isHovering ? 1.1 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.8,
      }}
    >
      <div className="relative">
        <motion.div
          className="w-6 h-6 rounded-full bg-white shadow-lg border-2 border-gray-300"
          animate={{
            scale: isClicking ? 0.8 : 1,
            backgroundColor: isClicking ? "#f3f4f6" : "#ffffff",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-gray-600"
          style={{
            x: "-50%",
            y: "-50%",
          }}
          animate={{
            scale: isClicking ? 0.5 : 1,
            opacity: isClicking ? 0.7 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-white"
          style={{
            x: "-50%",
            y: "-50%",
          }}
          animate={{
            scale: isClicking ? 0.3 : 0.8,
            opacity: isClicking ? 0.5 : 0.9,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
        />
      </div>
    </motion.div>
  );
}
