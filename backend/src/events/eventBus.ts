import EventEmitter from 'events';

class EventBus extends EventEmitter {}

const eventBus = new EventBus();
eventBus.setMaxListeners(20);

export default eventBus;
