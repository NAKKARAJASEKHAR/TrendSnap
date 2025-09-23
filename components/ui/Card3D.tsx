/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "../../lib/utils";

export const Card3D = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
} & React.ComponentProps<typeof motion.div>) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };

  const rotateX = useSpring(
    useTransform(mouseY, [-200, 200], [15, -15]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-200, 200], [-15, 15]),
    springConfig
  );

  const glareOpacity = useSpring(
    useTransform(mouseX, [-200, 0, 200], [0.4, 0, 0.4]),
    springConfig
  );
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { width, height, left, top } =
      cardRef.current?.getBoundingClientRect() ?? {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
      };
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    mouseX.set(deltaX);
    mouseY.set(deltaY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
        className="[perspective:1000px]"
        {...props}
    >
        <motion.div
            ref={cardRef}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative rounded-lg shadow-lg [transform-style:preserve-3d] overflow-hidden",
                className
            )}
        >
            <div style={{ transform: "translateZ(20px)" }}>{children}</div>
            <motion.div
                style={{
                    opacity: glareOpacity,
                    background: `radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)`,
                    transform: "translate(-50%, -50%)",
                    left: useTransform(mouseX, (v) => `${50 + v * 0.1}%`),
                    top: useTransform(mouseY, (v) => `${50 + v * 0.1}%`),
                }}
                className="pointer-events-none absolute inset-0 rounded-lg select-none"
            />
        </motion.div>
    </motion.div>
  );
};
