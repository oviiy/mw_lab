import type { ComponentChildren } from 'preact';
import { createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

export interface Layout {
  port: boolean;
  W: number;
  H: number;
  scale: number;
}

function compute(): Layout {
  const port = innerWidth / innerHeight < 0.85;
  const W = port ? 450 : 1280;
  const H = port ? 920 : 800;
  const scale = Math.min(innerWidth / W, innerHeight / H);
  return { port, W, H, scale };
}

const Ctx = createContext<Layout>(compute());

/** Latest layout, for code outside the component tree (fx, 3D). */
export const layoutRef: { current: Layout } = { current: compute() };

export function useLayout() {
  return useContext(Ctx);
}

/** Fixed design resolution (landscape 1280×800 / portrait 450×920), scaled to fit the viewport. */
export function Stage({ children }: { children: ComponentChildren }) {
  const [L, setL] = useState(compute);
  useEffect(() => {
    const on = () => setL(compute());
    addEventListener('resize', on);
    return () => removeEventListener('resize', on);
  }, []);
  layoutRef.current = L;
  return (
    <Ctx.Provider value={L}>
      <div class={`stage ${L.port ? 'port' : 'land'}`} style={{ width: `${L.W}px`, height: `${L.H}px`, transform: `translate(-50%, -50%) scale(${L.scale})` }}>
        {children}
      </div>
    </Ctx.Provider>
  );
}
