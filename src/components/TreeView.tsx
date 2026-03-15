/**
 * TreeView — orchestrator that picks mobile vs desktop layout.
 * All sub-components live in ./tree/ and ./TreeViewMobile.
 */
import React, { useState, useEffect } from 'react';
import { useStore, verbRoots } from '../store/useStore';
import { loadRootDetail } from '../data/verbs';
import type { VerbRoot } from '../data/verbs';
import { MobileDrillDown } from './TreeViewMobile';
import { DesktopTreeView } from './tree/DesktopTreeView';

export const TreeView: React.FC = () => {
  const { selectedRoot, backToSpace } = useStore();
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [rootDetail, setRootDetail] = useState<VerbRoot | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Lazy-load full root detail when selection changes
  useEffect(() => {
    if (!selectedRoot) { setRootDetail(null); return; }

    // Check if index entry already has full data (has tenses)
    const indexEntry = verbRoots.find(r => r.id === selectedRoot) ?? null;
    const alreadyFull = indexEntry?.babs?.some(b => b.tenses && b.tenses.length > 0) ?? false;
    if (alreadyFull) { setRootDetail(indexEntry); return; }

    setLoading(true);
    loadRootDetail(selectedRoot).then(detail => {
      setRootDetail(detail ?? indexEntry);
      setLoading(false);
    });
  }, [selectedRoot]);

  useEffect(() => {
    if (rootDetail) requestAnimationFrame(() => setVisible(true));
    return () => setVisible(false);
  }, [rootDetail]);

  if (!selectedRoot) return null;

  if (loading || !rootDetail) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
        <div style={{ color: '#fff', fontSize: '2rem', fontFamily: 'Scheherazade New, serif', direction: 'rtl', opacity: 0.8 }}>
          {selectedRoot ? verbRoots.find(r => r.id === selectedRoot)?.root ?? '…' : '…'}
          <div style={{ fontSize: '0.8rem', marginTop: 8, fontFamily: 'sans-serif', direction: 'ltr', textAlign: 'center', opacity: 0.6 }}>Loading…</div>
        </div>
      </div>
    );
  }

  return isMobile
    ? <MobileDrillDown root={rootDetail} backToSpace={backToSpace} visible={visible} />
    : <DesktopTreeView root={rootDetail} backToSpace={backToSpace} visible={visible} />;
};
