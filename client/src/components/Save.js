import React, {useCallback} from 'react';
import { Panel, getRectOfNodes, getTransformForBounds, useReactFlow } from 'reactflow';
import { js2xml, xml2js } from 'xml-js';
import { toPng } from 'html-to-image';

function downloadImage(dataUrl) {
  const a = document.createElement('a');

  a.setAttribute('download', 'reactflow.png');
  a.setAttribute('href', dataUrl);
  a.click();
}

const Save = ({setOperation, reactFlowInstance, setNodes, setEdges, setViewport, setMySelectedNodes, setMySelectedEdges}) => {
    const { getNodes } = useReactFlow();
    const onSave = useCallback(() =>{
        if (reactFlowInstance) {
          const flow = reactFlowInstance.toObject();
          const flowWithRoot = { root: flow};
          const flowXml = js2xml(flowWithRoot, { compact: true, spaces: 4 });
          const blob = new Blob([flowXml], { type: 'application/xml' });
          const href = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = href;
          link.download = 'flow.xml';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
    }, [reactFlowInstance]);
    
    const onRestore = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xml';
        input.onchange = (event) => {
          const file = event.target.files[0];
          const reader = new FileReader();
          reader.onload = (event) => {
            const xml = event.target.result;
            try {
              const result = xml2js(xml, { compact: true });
              if (result && result.root) {
                const x = Number(result.root.viewport.x._text);
                const y = Number(result.root.viewport.y._text);
                const zoom = Number(result.root.viewport.zoom._text)
                let nodes = null;
                let edges = null;
                if(result.root.nodes){
                    const nodesArray = Array.isArray(result.root.nodes) ? result.root.nodes : [result.root.nodes];
                    nodes = nodesArray.map(node => ({
                    id: node.id._text,
                    position: {
                        x: Number(node.position.x._text),
                        y: Number(node.position.y._text),
                    },
                    data: {
                        label: node.data.label._text,
                        forceToolbarVisible: Boolean(node.data.forceToolbarVisible._text=== 'true' ? true : false),
                        textColor: node.data.textColor._text,
                        backgroundColor: node.data.backgroundColor._text,
                    },
                    type: node.type._text,
                    selected: node.selected && node.selected._text === 'true' ? true : false,
                    // style: {
                    //     width: Number(node.style.width._text),
                    //     height: Number(node.style.height._text),
                    // },
                    width: Number(node.width._text),
                    height: Number(node.height._text),
                    positionAbsolute:{
                        x: Number(node.positionAbsolute.x._text),
                        y: Number(node.positionAbsolute.y._text)
                    }
                    }));
                }
                if(result.root.edges){
                    const edgesArray = Array.isArray(result.root.edges) ? result.root.edges : [result.root.edges];
                    edges = edgesArray.map(edge => ({
                        id: edge.id._text,
                        source: edge.source._text,
                        sourceHandle: edge.sourceHandle._text? edge.sourceHandle._text :null,
                        target: edge.target._text,
                        targetHandle: edge.targetHandle._text? edge.targetHandle._text :null,
                        animated: edge.animated._text === 'true'? true : false,
                        style: {
                        stroke: edge.style.stroke._text,
                        },
                        markerEnd: {
                        type: edge.markerEnd.type._text,
                        },
                    }));
                }
                setNodes(nodes || []);
                setEdges(edges || []);
                setOperation('import');
                setMySelectedNodes(nodes||[]);
                setMySelectedEdges(edges||[]);
                setViewport({ x, y, zoom });
              }
            } catch (error) {
              console.error(error, "Invalid XML file");
              alert('Invalid XML file');
            }
          };
          reader.onerror = () => {
            alert('Error reading the file');
          }
          reader.readAsText(file);
        };
        input.click();
    }, [setNodes, setViewport, setEdges, setOperation, setMySelectedNodes, setMySelectedEdges]);

    const onImage = () => {
      const nodesBounds = getRectOfNodes(getNodes());
      const padding = 20;
      nodesBounds.x -= padding;
      nodesBounds.y -= padding;
      nodesBounds.width += padding * 2;
      nodesBounds.height += padding * 2;
      const viewportElement = document.querySelector('.react-flow__viewport');
      const imageWidth = viewportElement.clientWidth;
      const imageHeight = viewportElement.clientHeight;
      const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);
  
      toPng(viewportElement, {
        backgroundColor: '#1a365d',
        width: imageWidth,
        height: imageHeight,
        style: {
          width: imageWidth,
          height: imageHeight,
          transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
        },
      }).then(downloadImage);
    };

    return (
        <Panel position='bottom-center'>
            <div className="mt-6">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={onSave}>Export</button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={onRestore}>Import</button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={onImage}>Download Image</button>
            </div>
        </Panel>
    );
};

export default Save;