'use client';

import { SlidingNumber } from '@/components/ui/sliding-number';
import { useState } from 'react';

export function SlidingNumberWithSlider() {
  const [value, setValue] = useState(100);

  return (
    <div className='flex flex-col items-start gap-4'>
      <div className='flex items-center gap-2 font-mono'>
        Current ARR:
      </div>
      <div className='inline-flex items-center gap-1 font-mono leading-none text-2xl'>
        $<SlidingNumber value={value} />
      </div>
      <input
        type='range'
        value={value}
        min={500}
        max={100000}
        step={50}
        onChange={(e) => setValue(+e.target.value)}
        className='mt-2 accent-indigo-950 w-full'
      />
      <div className='text-sm text-muted-foreground'>
        Current value: {value}
      </div>
    </div>
  );
}