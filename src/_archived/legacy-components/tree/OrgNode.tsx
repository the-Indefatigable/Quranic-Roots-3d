import React from 'react';

/** Generic org-chart tree node for the desktop TreeView layout. */
export const OrgNode: React.FC<{
  content: React.ReactNode;
  childrenNodes?: React.ReactNode[];
  lineColor?: string;
  isExpanded?: boolean;
}> = ({ content, childrenNodes, lineColor = 'rgba(255,255,255,0.3)', isExpanded = true }) => {
  const hasChildren = isExpanded && childrenNodes && childrenNodes.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>{content}</div>
      {hasChildren && (
        <>
          <div style={{ width: '2px', height: '30px', background: lineColor }} />
          <div style={{ display: 'flex', position: 'relative' }}>
            {childrenNodes.map((child, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === childrenNodes.length - 1;
              const isOnly = childrenNodes.length === 1;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', padding: '0 24px' }}>
                  {!isOnly && (
                    <>
                      {!isFirst && <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '2px', background: lineColor }} />}
                      {!isLast  && <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '2px', background: lineColor }} />}
                    </>
                  )}
                  <div style={{ width: '2px', height: '30px', background: lineColor }} />
                  {child}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
