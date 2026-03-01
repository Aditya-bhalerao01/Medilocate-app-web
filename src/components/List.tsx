import React from 'react';
import { Facility } from '../types';
import FacilityCard from './FacilityCard';

interface ListProps {
  facilities: Facility[];
}

export default function List({ facilities }: ListProps) {
  if (facilities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
        <p className="text-lg font-medium">No facilities found.</p>
        <p className="text-sm">Try adjusting your filters or search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-y-auto h-full">
      {facilities.map((facility) => (
        <FacilityCard key={facility.id} facility={facility} />
      ))}
    </div>
  );
}
