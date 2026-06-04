/**
 * Event Bus — lightweight pub/sub for decoupled communication between modules.
 * Single responsibility: event routing. No business logic.
 */
const EventBus = (() => {
  const listeners = {};

  function on(event, fn) {
    (listeners[event] = listeners[event] || []).push(fn);
    return () => off(event, fn); // returns unsubscribe
  }

  function off(event, fn) {
    const ls = listeners[event];
    if (ls) listeners[event] = ls.filter(f => f !== fn);
  }

  function emit(event, data) {
    (listeners[event] || []).forEach(fn => fn(data));
  }

  return { on, off, emit };
})();