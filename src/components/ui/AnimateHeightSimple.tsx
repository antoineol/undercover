import AnimateHeight from "react-animate-height";

export function AnimateHeightSimple({
  children,
  open,
}: {
  children: React.ReactNode;
  open: boolean | undefined;
}) {
  return (
    <AnimateHeight
      height={open ? "auto" : 0}
      duration={300}
      easing="ease-in-out"
      animateOpacity
    >
      {children}
    </AnimateHeight>
  );
}
