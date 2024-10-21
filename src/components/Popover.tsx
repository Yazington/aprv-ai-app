'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function Popover({ children, content, trigger = 'click' }: any) {
  const [show, setShow] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  const handleMouseOver = () => {
    if (trigger === 'hover') {
      setShow(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setShow(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setShow(false);
      }
    }

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [show]);

  useEffect(() => {
    if (show && wrapperRef.current && popoverRef.current) {
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();

      let top = wrapperRect.bottom + window.scrollY;
      let left = wrapperRect.left + window.scrollX;

      // Adjust position if popover overflows viewport horizontally
      if (left + popoverRect.width > window.scrollX + window.innerWidth) {
        left = window.scrollX + window.innerWidth - popoverRect.width - 10; // Add some padding from the edge
      }

      // Adjust position if popover overflows viewport vertically
      if (top + popoverRect.height > window.scrollY + window.innerHeight) {
        top = wrapperRect.top + window.scrollY - popoverRect.height;
      }

      // If the popover still overflows the top, position it at the top edge
      if (top < window.scrollY) {
        top = window.scrollY + 10; // Add some padding from the edge
      }

      // If the popover still overflows the left, position it at the left edge
      if (left < window.scrollX) {
        left = window.scrollX + 10; // Add some padding from the edge
      }

      setPopoverPosition({ top, left });
    }
  }, [show]);

  return (
    <>
      <div
        ref={wrapperRef}
        onMouseEnter={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        className="relative inline-block"
        onClick={() => trigger === 'click' && setShow(!show)}
      >
        {children}
      </div>

      {show &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'absolute',
              top: popoverPosition.top,
              left: popoverPosition.left,
              zIndex: 50,
            }}
            className="font-inherit m-2 rounded bg-darkBg4 p-2 text-inherit text-textTert shadow-all-around"
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}

export default Popover;
