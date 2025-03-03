import '@/styles/index.css';
import { createRoot } from 'react-dom/client';

import { SnapshotApp } from './SnapshotApp';

const root = createRoot(document.getElementById('app')!);
root.render(<SnapshotApp />);
