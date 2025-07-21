import React, { useEffect, useRef, FC } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
}

const Mermaid: FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    // 只需初始化一次
    mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          primaryColor: "#22223b",
          primaryTextColor: "#f8f8f2",
          lineColor: "#f8f8f2",
          fontFamily: "inherit",
     }});

    if (ref.current) {
      const id = "mermaid-" + Math.random().toString(36).slice(2, 9);
      mermaid
        .render(id, chart)
        .then(({ svg }) => {
          if (isMounted && ref.current) {
            ref.current.innerHTML = svg;
          }
        })
        .catch((err) => {
          if (ref.current) {
            ref.current.innerHTML = `<pre style="color:red;">Mermaid 渲染失败：${String(err)}</pre>`;
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [chart]);

  return <div ref={ref} />;
};

export default Mermaid;