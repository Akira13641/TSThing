'use client';

import { Game } from '../../components/Game';

export default function Home() {
  return (
    <div style={{ margin: 0, padding: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Game showDebug={true} />
    </div>
  );
}