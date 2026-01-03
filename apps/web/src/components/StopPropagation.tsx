import { ReactNode, SyntheticEvent } from "react";

export function StopPropagation({ children }: { children: ReactNode }) {
  const stopPropagation = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <span onClick={stopPropagation} onPointerDown={stopPropagation} onMouseDown={stopPropagation}>
      {children}
    </span>
  );
}
