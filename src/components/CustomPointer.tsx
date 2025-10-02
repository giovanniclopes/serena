import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

interface iOSPointerProps {
  isVisible?: boolean;
}

export default function CustomPointer({ isVisible = true }: iOSPointerProps) {
  const [isClicking, setIsClicking] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 1500, damping: 60 });
  const springY = useSpring(mouseY, { stiffness: 1500, damping: 60 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 8);
      mouseY.set(e.clientY - 8);
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    if (isVisible) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        x: springX,
        y: springY,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: isClicking ? 0.8 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 1500,
        damping: 60,
      }}
    >                                                                       
      <div className="relative">
        <motion.div
          className="w-4 h-4 rounded-full bg-white shadow-lg border border-blue-200"
          animate={{
            scale: isClicking ? 0.8 : 1,
            backgroundColor: isClicking ? "#ec4899" : "#ec4899",
            boxShadow: isClicking
              ? "0 0 0 8px #ec4899"
              : "0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 1px #ec4899",
          }}
          transition={{
            type: "spring",
            stiffness: 1200,
            damping: 20,
          }}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-white"
          style={{
            x: "-50%",
            y: "-50%",
          }}
          animate={{
            scale: isClicking ? 0.6 : 1,
            opacity: isClicking ? 0.8 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 1200,
            damping: 20,
          }}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-white"
          style={{
            x: "-50%",
            y: "-50%",
          }}
          animate={{
            scale: isClicking ? 0.4 : 0.8,
            opacity: isClicking ? 0.6 : 0.9,
          }}
          transition={{
            type: "spring",
            stiffness: 1200,
            damping: 20,
          }}
        />

        {isClicking && (
          <motion.div
            className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full border-2 border-blue-300"
            style={{
              x: "-50%",
              y: "-50%",
            }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
