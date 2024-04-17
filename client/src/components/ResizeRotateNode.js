import React, { useEffect, useState, useRef } from 'react';
import { Handle, Position, useUpdateNodeInternals, NodeToolbar } from 'reactflow';
import { drag } from 'd3-drag';
import { select } from 'd3-selection';
import { NodeResizer } from '@reactflow/node-resizer';


import '@reactflow/node-resizer/dist/style.css';
import styles from './style.module.css';

export default function ResizeRotateNode({
  id,
  sourcePosition = Position.Left,
  targetPosition = Position.Right,
  data,
}) {
  const rotateControlRef = useRef(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const [rotation, setRotation] = useState(0);
  const [resizable, setResizable] = useState(true);
  const [rotatable, setRotatable] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF'); // Default color white
  const [textColor, setTextColor] = useState('#000000'); // Default color black
  const [toolbarVisible, setToolbarVisible] = useState(false); // or initialize with whatever default visibility you want

  useEffect(() => {
    if (!rotateControlRef.current) {
      return;
    }

    const selection = select(rotateControlRef.current);
    const dragHandler = drag().on('drag', (evt) => {
      const dx = evt.x - 100;
      const dy = evt.y - 100;
      const rad = Math.atan2(dx, dy);
      const deg = rad * (180 / Math.PI);
      setRotation(180 - deg);
      updateNodeInternals(id);
    });

    selection.call(dragHandler);
  }, [id, updateNodeInternals]);

  useEffect(() => {
    if (data && typeof data.forceToolbarVisible !== 'undefined') {
      setToolbarVisible(data.forceToolbarVisible);
    }
  }, [data]);  

  const handleColorChange = (event) => {
    setBackgroundColor(event.target.value);
  };

  const handleTextColorChange = (event) => {
    setTextColor(event.target.value);
  };

  console.log(data,"data")

  return (
    <>
      <div
        style={{
          position: "relative",
          transform: `rotate(${rotation}deg)`,
          backgroundColor: backgroundColor,
          color: textColor,
          textAlign: "center"
        }}
        className={styles.node}
      >
        <NodeResizer isVisible={resizable} minWidth={100} minHeight={100} />
        <div
          ref={rotateControlRef}
          style={{
            display: rotatable ? 'block' : 'none',
          }}
          className={`nodrag ${styles.rotateHandle}`}
        />
        <div style={{ position: 'relative' }}>
        <NodeToolbar
          isVisible={toolbarVisible}
          position='right'
          style={{ maxHeight: '200px', overflowY: 'auto' }} 
        >
       {/*<div>
             <label>
              Label:
              <input
                type="text"
                value={data.label}
                onChange={(evt) => handleLabelChange(evt.target.value)}
              />
            </label>
          </div> */}
          <div>
            <label>
              <input
                type="checkbox"
                checked={resizable}
                onChange={(evt) => setResizable(evt.target.checked)}
              />
              resizable
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={rotatable}
                onChange={(evt) => setRotatable(evt.target.checked)}
              />
              rotatable
            </label>
          </div>
          <div>
            <label>
              Background Color:
              <input
                type="color"
                onChange={handleColorChange}
                defaultValue={backgroundColor}
              />
            </label>
          </div>
          <div>
            <label>
              Text Color:
              <input
                type="color"
                onChange={handleTextColorChange}
                defaultValue={textColor}
              />
            </label>
          </div>
      </NodeToolbar>
      </div>
        <div >
          {data?.label}
        </div>
        <Handle style={{ opacity: 0 }} position={sourcePosition} type="source" />
        <Handle style={{ opacity: 0 }} position={targetPosition} type="target" />
      </div>
    </>
  );
}
