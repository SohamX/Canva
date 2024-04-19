import ReactFlow, { addEdge, Background, Controls, MiniMap, Panel, useEdgesState, useNodesState, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { useState, useRef, useCallback, useEffect  } from 'react';
import ResizeRotateNode from './ResizeRotateNode.js';
import BgType from './BgType.js';
import Sidebar from './Sidebar.js';
// const initialNodes = [
//     { id: '1', data: { label: '-' }, position: { x: 100, y: 100 } },
//     { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 200 } },
//   ];

const nodeorigin = [0.5, 0.5];

const defaultNodes = [
  {
    id: "1",
    position: { x: 100, y: 100 },
    data: { label: "Node 1", forceToolbarVisible: false, textColor: '#000000', backgroundColor: '#FFFFFF'},
    type: "resizeRotate",
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    selected: true,
    style: { width: 180, height: 100 }
  },
  {
    id: "2",
    position: { x: 100, y: 400 },
    data: { label: "Node 2", forceToolbarVisible: false, textColor: '#000000', backgroundColor: '#FFFFFF' },
    type: "resizeRotate",
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    style: { width: 180, height: 100 }
  }
];

// const defaultEdges = [
//   {
//     id: "1->2",
//     source: "1",
//     target: "2",
//     type: "SimpleBezier"
//   }
// ];

const nodeTypes = {
  resizeRotate: ResizeRotateNode
};

const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: "#9ca8b3" },
  markerEnd: {
    type: "arrowclosed"
  }
};

let id = 0;
const getId = () => `dndnode_${id++}`;

const Whiteboard = ({socket,roomId,username,email})=> {
    const reactFlowWrapper = useRef(null);
    const [variant, setVariant] = useState('cross');
    const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectNode, setSelectNode] = useEdgesState({})
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [myNode, setMyNode] = useState(defaultNodes)
    const [myEdge, setMyEdge] = useState(null)
    const [operation, setOperation] = useState('');
    const [mySelectedNodes, setMySelectedNodes] = useState([]);
    const [mySelectedEdges, setMySelectedEdges] = useState([]);

    const handleBgColorChange = (nodeId, newBackgroundColor) => {
      setNodes((nodes) =>
        nodes.map((node) => 
          node.id === nodeId ? { ...node, data: { ...node.data, backgroundColor: newBackgroundColor } } : node
        )
      );
    };
    
    const handleTextColorChange = (nodeId, newTextColor) => {
      setNodes((nodes) =>
        nodes.map((node) => 
          node.id === nodeId ? { ...node, data: { ...node.data, textColor: newTextColor } } : node
        )
      );
    };

    const onConnect = (params) => {
      const newEdge = {
        id: `e${params.source}-${params.target}`,
        ...params,
        animated: true,
        style: { stroke: '#f6ab6c' },
      };
      // Update the state with the new edge
      setEdges((e) => [...e, newEdge]);
      console.log(newEdge);
      setOperation('adding');
      setMyEdge(newEdge);
    };

    const onEdgesDelete = (elementsToRemove) => {
      setOperation('deleting');
      if(elementsToRemove.length === 1){
        setMyEdge(elementsToRemove[0]);
      }
      else{
        setMySelectedEdges(elementsToRemove);
      }
    };
  
    const onDragOver = useCallback((event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }, []);
  
    const onDrop = useCallback(
      (event) => {
        event.preventDefault();
  
        const type = event.dataTransfer.getData('application/reactflow');
  
        // check if the dropped element is valid
        if (typeof type === 'undefined' || !type) {
          return;
        }
  
        // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
        // and you don't need to subtract the reactFlowBounds.left/top anymore
        // details: https://reactflow.dev/whats-new/2023-11-10
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const newNode = {
          id: getId(),
          type,
          position,
          data: { label: `node ${id}`, forceToolbarVisible: false, textColor: '#000000', backgroundColor: '#FFFFFF'},
        };
  
        setNodes((nds) => nds.concat(newNode));
        setMyNode(newNode);
        setOperation('adding');
      },
      [reactFlowInstance],
    );

    const onNodeDoubleClick = (event, node) => {
      if(selectNode=={}||selectNode.id!==node.id){
        setSelectNode(node)
      }
      else{
        setSelectNode({})
      }
    }

    const onNodeDrag = (event, node) => {
      delete node.dragging;
      delete node.selected;
      delete node.positionAbsolute;
      setMyNode(node);
      setOperation('dragging');
    };

    const onSelectionDrag = (event, nodes) => {
      const newNodes = nodes.map(node => {
        const { dragging, selected, positionAbsolute, ...rest } = node;
        return rest;
      });
      setMySelectedNodes(newNodes);
      setOperation('dragging');
    }

    const onNodesDelete = (elementsToRemove) => {
      if(elementsToRemove.length === 1){
        setMyNode(elementsToRemove[0]);
        setOperation('deleting');
      }     
      else{
        setMySelectedNodes(elementsToRemove)
        setOperation('deleting');
      }
    };

    useEffect(() => {
      const errorHandler = (e) => {
        if (
          e.message.includes(
            "ResizeObserver loop completed with undelivered notifications" ||
              "ResizeObserver loop limit exceeded"
          )
        ) {
          const resizeObserverErr = document.getElementById(
            "webpack-dev-server-client-overlay"
          );
          if (resizeObserverErr) {
            resizeObserverErr.style.display = "none";
          }
        }
      };
      window.addEventListener("error", errorHandler);
    
      return () => {
        window.removeEventListener("error", errorHandler);
      };
    }, []);

   useEffect(() => {
  // Find the node that is being resized
  const resizingNode = nodes.find((node) => node.resizing);
    console.log(resizingNode);
  // If a node is being resized and it's not the same as the current myNode, update myNode
  if (resizingNode) {
    setOperation('resizing');
    setMyNode(resizingNode);
  }

  // If no node is being resized and myNode is not empty, set myNode to an empty object
  if (!resizingNode && Object.keys(myNode).length > 0) {
    setMyNode({});
  }
}, [nodes]);

useEffect(() => {
  const handleAddingEdge = ({ myEdge: newEdge, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      setEdges((edges) => edges.concat(newEdge));
    }
  };
  const handleAddingNode = ({ myNode: newNode, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      setNodes((nodes) => nodes.concat(newNode));
      id++;
    }
  };
  const handleDeletingEdge = ({ id, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      setEdges((edges) => edges.filter((edge) => edge.id !== id));
    }
  };
  const handleDeletingEdges = ({ ids, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      setEdges((edges) => edges.filter((edge) => !ids.some((id) => id === edge.id)));
    }
  };
  const handleDeletingNode = ({ id, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      setNodes((nodes) => nodes.filter((node) => node.id !== id));
    }
  };
  const handleDeletingNodes = ({ ids, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      setNodes((nodes) => nodes.filter((node) => !ids.some((id) => id === node.id)));
    }
  };
  const handleDraggingNode = ({ id, position, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      setNodes((nodes) =>
        nodes.map((node) => 
          node.id === id ? { ...node, position } : node
        )
      );
    }
  };
  const handleDraggingNodes = ({ ids, positions, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      setNodes((nodes) =>
        nodes.map((node) => {
          const index = ids.indexOf(node.id);
          if (index !== -1) {
            return { ...node, position: positions[index] };
          }
          return node;
        })
      );
    }
  };
  const handleResizingNode = ({ id, style, width, height, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id ? { ...node, style, width, height } : node
        )
      );
    }
  };
  const handleUpdatingLabelNode = ({ id, label, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      setNodes((nodes) =>
      nodes.map((node) => 
        node.id === id ? {...node, data: { ...node.data, label} } : node
        )
      );
    }
  };
  const handleUpdattinTextColor = ({ id, textColor, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      setNodes((nodes) =>
      nodes.map((node) => 
        node.id === id ? {...node, data: { ...node.data, textColor} } : node
        )
      );
    }
  };
  const handleUpdatingBgColor = ({ id, backgroundColor, email: senderEmail, username: otheruser }) => {
    if (senderEmail !== email) {
      setNodes((nodes) =>
      nodes.map((node) => 
        node.id === id ? {...node, data: { ...node.data, backgroundColor} } : node
        )
      );
    }
  };

  socket.on('addingEdge', handleAddingEdge);
  socket.on('addingNode', handleAddingNode);
  socket.on('deletingEdge', handleDeletingEdge);
  socket.on('deletingSelectedEdges', handleDeletingEdges);
  socket.on('deletingNode', handleDeletingNode);
  socket.on('deletingSelectedNodes', handleDeletingNodes);
  socket.on('draggingNode', handleDraggingNode);
  socket.on('draggingSelectedNodes', handleDraggingNodes);
  socket.on('resizingNode', handleResizingNode);
  socket.on('updatingLabelNode', handleUpdatingLabelNode);
  socket.on('updatingTextColor', handleUpdattinTextColor);
  socket.on('updatingBgColor', handleUpdatingBgColor);
  return () => {
    socket.off('addingNode');
    socket.off('addingEdge');
    socket.off('deletingEdge');
    socket.off('deletingSelectedEdges');
    socket.off('deletingNode');
    socket.off('deletingSelectedNodes');
    socket.off('draggingNodes');
    socket.off('draggingSelectedNodes');
    socket.off('resizingNode');
    socket.off('updatingLabelNode');
    socket.off('updatingTextColor');
    socket.off('updatingBgColor');
  };  
}, [email, socket]);

useEffect(() => {
    socket.emit('nodeUpdates', { myNode, roomId, username, email, operation });
    setOperation('');
}, [myNode, roomId, username, email, socket]);

useEffect(() => {
  socket.emit('selectedNodesUpdates', { mySelectedNodes, roomId, username, email, operation });
  setOperation('');
}, [mySelectedNodes, roomId, username, email, socket]);

useEffect(() => {
  socket.emit('edgeUpdates', { myEdge, roomId, username, email, operation });
  setOperation('');
},[myEdge, roomId, username, email, socket]);

useEffect(() => {
  socket.emit('selectedEdgesUpdates', { mySelectedEdges, roomId, username, email, operation });
  setOperation('');
},[mySelectedEdges, roomId, username, email, socket]);


    return(
      <>
        <div className="reactflow-wrapper" class="fixed top-0 left-0 h-[100vh] w-[100vw]" ref={reactFlowWrapper}>
            <ReactFlow  
            defaultEdgeOptions={defaultEdgeOptions}
            defaultViewport={{ zoom: 1, x: 0, y: 0 }}
            edges={edges}
            fitView
            fitViewOptions={{ padding: 0.4 }}
            nodes={nodes}
            nodeOrigin={nodeorigin}
            nodeTypes={nodeTypes}
            onEdgesChange={onEdgesChange}
            onEdgesDelete={onEdgesDelete}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onInit={setReactFlowInstance}
            onNodesChange={onNodesChange}
            onNodeDoubleClick= {onNodeDoubleClick}
            onNodeDrag= {onNodeDrag}
            onNodesDelete={onNodesDelete}
            onSelectionDrag={onSelectionDrag}
            onTextColourChange={handleTextColorChange}
            onBgColourChange={handleBgColorChange}
            >
            <Background color="#ccc" variant={variant} />
            <BgType setVariant={setVariant}/>
            <Controls />
            {/* <ToolVisible setNodes={setNodes} /> */}
            <MiniMap nodeStrokeWidth={3} zoomable pannable position='top-right' />
            </ReactFlow>
        </div>
        <Sidebar selectNode={selectNode} setNodes={setNodes} setMyNode={setMyNode} setOperation={setOperation} /*onUpdateNode={(selectNode)=>update*//> 
      </>
    )
}

export default Whiteboard;