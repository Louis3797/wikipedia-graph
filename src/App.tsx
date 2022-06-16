/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useRef, useState, useCallback } from "react";
import { ForceGraph3D } from "react-force-graph";
import { API_PREFIX, API_SUFFIX } from "./utils/constants";
import generateColorHex from "./utils/generateHexColor";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { Link, Node } from "./types";
import { useControls } from "leva";

function App() {
  // stores all node as state
  const [nodes, setNodes] = useState<Node[]>([]);

  // stores all connections between nodes as state
  const [links, setLinks] = useState<Link[]>([]);

  // ref of our graph
  const graphRef = useRef<any>();

  const config = useControls({
    page: "Albert Einstein",
    depth: {
      value: 5,
      min: 1,
      max: 30,
      step: 1
    },
    numLinks: {
      value: 10,
      min: 1,
      max: 50,
      step: 1
    }
  });

  // method to zoom in to a node if we click on it
  const handleNodeClick = useCallback(
    (node: any) => {
      // Aim at node from outside it
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      graphRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000 // ms transition duration
      );
    },
    [graphRef]
  );

  // Recursice function to fetch Wikipedia links and create nodes
  // title: Title of the page we want to fetch the data fro
  // depth: Depth of recursion
  // numberOfLinks: Number of Links we want to fetch from the given title page
  // parentNode: ParentNode for link creation
  function getData(title: string, depth: number, numberOfLinks: number, parentNode: Node): void {
    // if depth is 0 than return
    if (depth === 0) {
      return;
    }

    // reduce depth to get to the
    // base case of the recursion
    depth -= 1;

    // url for fetching
    const url = API_PREFIX + title + API_SUFFIX + numberOfLinks;

    // fetch and cache results
    fetch(url, { cache: "force-cache" })
      .then((response) => response.json())
      .then((response) => {
        const pages = response.query.pages;

        for (let p in pages) {
          // generate random light hex Color
          const hexColor: string = generateColorHex();
          for (let l of pages[p].links) {
            // get title
            const res: string = l.title;

            // create new node
            const newNode: Node = {
              title: res,
              color: hexColor
            };

            setNodes((n) => [...n, newNode]);

            // create link
            const newLink: Link = { source: parentNode, target: newNode };
            setLinks((l) => [...l, newLink]);

            // recursive call
            getData(res, depth, numberOfLinks, newNode);
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  useEffect(() => {
    // delete all node
    setNodes([]);

    // delete all links between nodes
    setLinks([]);

    // create first node and add it to nodes
    const firstNode: Node = {
      title: config.page,
      color: generateColorHex()
    };

    // add firdt node
    setNodes((n) => [...n, firstNode]);

    // call getData to scrap wikipedia page of first node
    getData(config.page, config.depth, config.numLinks, firstNode);

    // setup postprocessing
    const bloomPass: UnrealBloomPass = new UnrealBloomPass();
    bloomPass.strength = 1;
    bloomPass.radius = 1;
    bloomPass.threshold = 0.1;
    graphRef.current.postProcessingComposer().addPass(bloomPass);
    // graphRef.current.d3Force("charge").strength(-200);
  }, [config]);

  return (
    <div className="container">
      <ForceGraph3D
        graphData={{ nodes, links }}
        linkWidth={2}
        // @ts-ignore
        nodeAutoColorBy={(n) => n.color}
        // linkDirectionalParticles={2}
        ref={graphRef}
        onNodeClick={handleNodeClick}
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
    </div>
  );
}

export default App;
