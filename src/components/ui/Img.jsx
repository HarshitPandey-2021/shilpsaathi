import React, { useState } from 'react';

export default function Img({ src, alt = '', className = '', imgClass = '', ...rest }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${className}`}>
      {!loaded && <div className="skeleton absolute inset-0" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-all duration-500 ease-out ${
          loaded ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-md'
        } ${imgClass}`}
        {...rest}
      />
    </div>
  );
}