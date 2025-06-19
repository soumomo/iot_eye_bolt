import React, { useState } from 'react';

interface ColorGroup {
  name: string;
  color: string;
  border: string;
  letters: string[];
}

interface ColorWheelSelectorProps {
  colorGroups: ColorGroup[];
  currentColorGroup: number;
  onColorSelect: (index: number) => void;
  size?: number;
}

const ColorWheelSelector: React.FC<ColorWheelSelectorProps> = ({
  colorGroups,
  currentColorGroup,
  onColorSelect,
  size = 56,
}) => {
  const [hoveredGroup, setHoveredGroup] = useState<number | null>(null);

  const getSegmentPath = (index: number, total: number) => {
    const angle = (360 / total);
    const startAngle = (angle * index - 90) * (Math.PI / 180);
    const endAngle = (angle * (index + 1) - 90) * (Math.PI / 180);
    
    const center = size / 2;
    const outerRadius = size * 0.4;
    const innerRadius = size * 0.2;
    
    const x1 = center + outerRadius * Math.cos(startAngle);
    const y1 = center + outerRadius * Math.sin(startAngle);
    const x2 = center + outerRadius * Math.cos(endAngle);
    const y2 = center + outerRadius * Math.sin(endAngle);
    
    const x3 = center + innerRadius * Math.cos(endAngle);
    const y3 = center + innerRadius * Math.sin(endAngle);
    const x4 = center + innerRadius * Math.cos(startAngle);
    const y4 = center + innerRadius * Math.sin(startAngle);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  const getColorClass = (tailwindColor: string) => {
    const colorMap: { [key: string]: string } = {
      'bg-green-500': '#10b981',
      'bg-yellow-500': '#facc15',
      'bg-pink-500': '#ec4899',
      'bg-blue-500': '#3b82f6',
      'bg-gray-900': '#111827',
      'bg-red-500': '#ef4444',
    };
    return colorMap[tailwindColor] || '#ffffff';
  };

  const getOpacity = (index: number) => {
    if (currentColorGroup === index) return 1;
    if (hoveredGroup === index) return 0.9;
    return 0.4;
  };

  const getGlow = (index: number) => {
    if (hoveredGroup === index || currentColorGroup === index) {
      const colorHex = getColorClass(colorGroups[index].color);
      return `0 0 20px ${colorHex}80, 0 0 40px ${colorHex}40`;
    }
    return 'none';
  };

  const selectedColorHex = getColorClass(colorGroups[currentColorGroup].color);

  return (
    <div className="relative">
      {/* Glassmorphic background */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-2xl"></div>
      
      {/* Color Wheel */}
      <svg 
        width={size}
        height={size} 
        className="relative z-10"
        style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.3))' }}
      >
        {colorGroups.map((group, index) => (
          <path
            key={group.name}
            d={getSegmentPath(index, colorGroups.length)}
            fill={getColorClass(group.color)}
            opacity={getOpacity(index)}
            className="cursor-pointer transition-all duration-300 ease-out"
            style={{
              filter: getGlow(index)
            }}
            onMouseEnter={() => setHoveredGroup(index)}
            onMouseLeave={() => setHoveredGroup(null)}
            onClick={() => onColorSelect(index)}
          />
        ))}
        
        {/* Center circle - glassmorphic */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size * 0.17}
          fill="rgba(255, 255, 255, 0.1)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
          style={{ backdropFilter: 'blur(10px)' }}
        />
      </svg>

      {/* Selected color indicator in center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div 
          className="rounded-full border-2 border-white/50 shadow-lg transition-all duration-300"
          style={{ 
            width: size * 0.14,
            height: size * 0.14,
            backgroundColor: selectedColorHex,
            boxShadow: `0 0 20px ${selectedColorHex}60`
          }}
        ></div>
      </div>
    </div>
  );
};

export default ColorWheelSelector;
