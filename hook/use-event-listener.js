"use strict";
import React, { useState, useEffect, useRef } from "react";

function useEventListener(eventName, handler, element, data) {
  // Create a ref that stores handler
  const savedHandler = useRef();
  const [counter, setCounter] = useState(0);
  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(
    () => {
      // Make sure element supports addEventListener
      // On
      const elementIsRef = element.hasOwnProperty("current");
      const currentElement = elementIsRef ? element.current : element;
      const isSupported = currentElement && currentElement.addEventListener;
      if (!isSupported) {
        console.log("Wrong element", currentElement);
        return;
      }
      console.log(typeof currentElement);
      console.log({ currentElement });
      // Create event listener that calls handler function stored in ref
      const eventListener = (event) => {
        if (savedHandler.current(event, data)) setCounter((c) => c + 1);
      };
      // Add event listener
      currentElement.addEventListener(eventName, eventListener);

      // Remove event listener on cleanup
      return () => {
        currentElement.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element] // Re-run if eventName or element changes
  );
  return counter;
}

export default useEventListener;
