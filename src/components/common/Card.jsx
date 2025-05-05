import React from 'react';

const Card = ({ 
  children, 
  className = '',
  padding = 'p-4',
  shadow = true,
  hover = false,
  border = true,
  rounded = 'rounded-xl',
  ...props 
}) => {
  return (
    <div
      className={`
        bg-white 
        ${rounded}
        ${border ? 'border border-gray-200' : ''}
        ${padding}
        ${shadow ? 'shadow hover:shadow-md transition-shadow duration-200' : ''}
        ${hover ? 'hover:bg-gray-50 transition-colors duration-200' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 