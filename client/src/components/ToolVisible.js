import { useCallback, } from 'react';
import { Panel } from 'reactflow';

const ToolVisible = ({setNodes})=> {
    const forceToolbarVisible = useCallback((enabled) =>
        setNodes((nodes) =>
        nodes.map((node) => ({
            ...node,
            data: { ...node.data, forceToolbarVisible: enabled },
        }))
        ),
    );
    return(
        <Panel position="top-left">
            <div className="mt-60">
                <h3>Override Node Toolbar visibility</h3>
                <label>
                    <input
                    type="checkbox"
                    onChange={(e) => forceToolbarVisible(e.target.checked)}
                    />
                    <span>Always show toolbar</span>
                </label>
            </div>
        </Panel>
    )
}

export default ToolVisible;