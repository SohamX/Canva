import React from 'react';
import { useCallback, useState } from 'react';

export default ({selectNode,setNodes,setMyNode,setOperation}) => {
  const [ label, setLabel ] = useState(selectNode.data?.label||'')
  const forceToolbarVisible = useCallback((enabled) => {
    setNodes((nodes) =>
    nodes.map((node) => ({
      ...node,
      data: { ...node.data, forceToolbarVisible: enabled },
    }))
    );
  });

  const handleBgColorChange = (event) => {
    if (selectNode && selectNode.data) {
      setMyNode(selectNode)
      setOperation('updatingBgColor');
      setMyNode((node) => ({
        ...node,
        data: { ...node.data, backgroundColor: event.target.value },
      }))
      setNodes((nodes) =>
      nodes.map(node => {
        if (node.id === selectNode.id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  backgroundColor: event.target.value
                }
              };
            }
            return node;
        })
      )
    }
  };

  const handleTextColorChange = (event) => {
    if (selectNode && selectNode.data) {
      setMyNode(selectNode)
      setOperation('updatingTextColor');
      setMyNode((node) => ({
        ...node,
        data: { ...node.data, textColor: event.target.value },
      }))
      setNodes((nodes) =>
      nodes.map(node => {
        if (node.id === selectNode.id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  textColor: event.target.value
                }
              };
            }
            return node;
          }
        )
      )
    }
  };


const handleLabelChange = (newLabel) => {
  if (selectNode && selectNode.data) {
    setMyNode(selectNode)
    setOperation('updatingLabel');
    setMyNode((node) => ({
      ...node,
      data: { ...node.data, label: newLabel},
    }))
    setNodes((nodes) =>
    nodes.map(node => {
      if (node.id === selectNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                label: newLabel
              }
            };
          }
          return node;
    })
    )
//    setNodes(myNode)
  }
};

  const handleUpdateClick = () => {
    // Call handleLabelChange with the current value of the input field
    handleLabelChange(label);
  };

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  
  return (
    <aside className="fixed inline-block z-2 border-r border-gray-300 p-4 h-2/6 bg-white overflow-y-auto md:w-64 lg:w-80 top-1/3 left-0 shadow-lg rounded-lg">
      <h1 className="text-lg font-semibold">SidePanel</h1>
      <div className="text-sm text-gray-600 mb-4">You can drag these nodes to the pane on the right.</div>
      <div className="dndnode input h-12 px-4 border border-blue-500 rounded-md flex justify-center items-center cursor-grab" onDragStart={(event) => onDragStart(event, 'resizeRotate')} draggable>
        resizeRotate Node
      </div>
          <h3 className="text-lg font-semibold">Override Node Toolbar visibility</h3>
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox mr-2"
                onChange={(e) => forceToolbarVisible(e.target.checked)}
              />
              <span className="text-sm">Always show toolbar</span>
            </label>
          </div>
      {selectNode.data ? (
        <>
        <h3 className="text-lg font-semibold">Selected: {selectNode.data.label}</h3>
        <div className="mt-4">
          <h4>Change Node name</h4>
          <label>
              Label:
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
          </label>
          <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
        onClick={handleUpdateClick}
      >
        Update
      </button>
        </div>
        <div>
            <label>
              Background Color:
              <input
                type="color"
                onChange={handleBgColorChange}
                defaultValue={selectNode.data.backgroundColor}
              />
            </label>
          </div>
          <div>
            <label>
              Text Color:
              <input
                type="color"
                onChange={handleTextColorChange}
                defaultValue={selectNode.data.textColor}
              />
            </label>
          </div>
        </>
      ) : null}
    </aside>
  );
};