'use client';

import Snofwall from 'react-snowfall';

export function GlobalSnowfall() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Snofwall color='#808080' snowflakeCount={400} />
    </div>
  );
}
