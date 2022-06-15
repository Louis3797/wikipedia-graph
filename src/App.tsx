/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useRef, useState, useCallback } from "react";
import { ForceGraph3D } from "react-force-graph";
import { API_PREFIX, API_SUFFIX } from "./utils/constants";
import generateColorHex from "./utils/generateHexColor";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { Link, Node } from "./types";

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  const [search, setSearch] = useState<string>("");

  const fgRef = useRef<any>();

  const handleClick = useCallback(
    (node: any) => {
      // Aim at node from outside it
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000 // ms transition duration
      );
    },
    [fgRef]
  );

  /*
    Recursice function to fetch Wikipedia links and create nodes
  */
  function getData(title: string, depth: number, parentNode: Node): void {
    if (depth === 0) {
      return;
    }

    depth -= 1;

    const url = API_PREFIX + title + API_SUFFIX;
    fetch(url, { cache: "force-cache" })
      .then((response) => response.json())
      .then((response) => {
        const pages = response.query.pages;
        for (let p in pages) {
          for (let l of pages[p].links) {
            const res: string = l.title;

            const newNode: Node = {
              title: res,
              color: generateColorHex()
            };

            setNodes((n) => [...n, newNode]);

            const newLink: Link = { source: parentNode, target: newNode };
            setLinks((l) => [...l, newLink]);

            const set: Set<Node> = new Set();
            nodes.forEach((n) => set.add(n));
            set.forEach((n) => {
              setNodes((e) => [...e, n]);
            });
            getData(res, depth, newNode);
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  useEffect(() => {
    setNodes([]);
    setLinks([]);

    const firstNode: Node = {
      title: "Albert Einstein",
      color: generateColorHex()
    };

    setNodes((n) => [...n, firstNode]);

    const bloomPass: any = new UnrealBloomPass();
    bloomPass.strength = 1.5;
    bloomPass.radius = 1;
    bloomPass.threshold = 0.1;
    fgRef.current.postProcessingComposer().addPass(bloomPass);
    fgRef.current.d3Force("charge").strength(-200);

    getData("Albert Einstein", 5, firstNode);
  }, []);

  return (
    <div className="h-full w-screen">
      <ForceGraph3D
        graphData={{ nodes, links }}
        linkWidth={2}
        // @ts-ignore
        nodeAutoColorBy="group"
        // linkDirectionalParticles={2}
        ref={fgRef}
        onNodeClick={handleClick}
        // @ts-ignore
        nodeLabel={(n) => `${n.title}`}
        nodeVal={40}
        warmupTicks={100}
        cooldownTicks={0}
        linkColor="#CDF0EA"
        linkOpacity={0.5}
        linkCurvature={Math.random()}
        linkCurveRotation={Math.random() * 360}
        // onEngineStop={() => fgRef.current.zoomToFit(400)}
      />
      <p className="absolute top-3 right-5 text-lg text-gray-100">Nodes: {nodes.length}</p>
      <input
        className="absolute m-auto right-0 left-0 w-96 text-white px-2 py-1 bg-gray-600 rounded-xl top-3 focus:outline-none"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}

export default App;
