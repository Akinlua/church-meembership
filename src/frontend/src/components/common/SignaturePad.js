import React, { useRef, useEffect, useState } from 'react';

const SignaturePad = ({ value, onChange, width = 500, height = 200 }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.strokeStyle = 'black';
      setCtx(context);
      
      // Clear canvas
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // If we have a saved signature, draw it
      if (value) {
        const img = new Image();
        img.onload = () => {
          context.drawImage(img, 0, 0);
        };
        img.src = value;
      }
    }
  }, []);

  // Redraw when value changes (e.g., when cleared)
  useEffect(() => {
    if (ctx && !value) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [value, ctx]);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const { offsetX, offsetY } = getCoordinates(e);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      ctx.closePath();
      setIsDrawing(false);
      
      // Save the signature as data URL
      const signatureData = canvasRef.current.toDataURL('image/png');
      onChange(signatureData);
    }
  };

  // Helper to get coordinates for both mouse and touch events
  const getCoordinates = (event) => {
    if (event.nativeEvent.offsetX !== undefined) {
      // Mouse event
      return {
        offsetX: event.nativeEvent.offsetX,
        offsetY: event.nativeEvent.offsetY
      };
    } else {
      // Touch event
      const rect = canvasRef.current.getBoundingClientRect();
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top
      };
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      style={{ 
        border: '1px solid #ddd', 
        borderRadius: '4px',
        touchAction: 'none' // Prevents scrolling while drawing on touch devices
      }}
    />
  );
};

export default SignaturePad; 