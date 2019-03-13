import { App } from '@yourwishes/app-base';
import { RESPONSE_OK } from '@yourwishes/app-api';
import {
  ServerAPI, ServerModule, IServerApp, ServerAPIHandler, ServerAPIRequest, ServerAPIResponse
} from './../../';

class DummyApp extends App implements IServerApp {
  server:ServerModule;

  constructor() {
    super();
    this.server = new ServerModule(this);
    this.modules.addModule(this.server);
  }
}

class DummyAPIHAndler extends ServerAPIHandler {
  constructor(method:string[]|string='GET', path:string[]|string='/test') {
    super(method, path);
  }

  async onRequest(request:ServerAPIRequest):Promise<ServerAPIResponse> {
    return { code: RESPONSE_OK, data: 'Testing'  }
  }
}



describe('ServerAPI', () => {
  it('should require a module', () => {
    expect(() => new ServerAPI(null)).toThrow();
    expect(() => new ServerAPI(undefined)).toThrow();
  });

  it('should be constructable', () => {
    expect(() => new ServerAPI(new DummyApp().server)).not.toThrow();
  });
});

describe('addAPIHandler', () => {
  let app = new DummyApp();
  let { server } = app;

  it('should require a real APIHandler', () => {
    let api = new ServerAPI(server);
    let handler = new DummyAPIHAndler();
    expect(() => api.addAPIHandler(null)).toThrow();
    expect(() => api.addAPIHandler(handler)).not.toThrow();
  });

  it('should add an API Handler to the list', () => {
    let api = new ServerAPI(server);
    let handler = new DummyAPIHAndler();
    expect(api.apiHandlers).not.toContain(handler);
    api.addAPIHandler(handler);
    expect(api.apiHandlers).toContain(handler);
  });

  it('should not add it to the list twice', () => {
    let api = new ServerAPI(server);
    let handler = new DummyAPIHAndler();
    expect(api.apiHandlers).not.toContain(handler);
    api.addAPIHandler(handler);
    expect(api.apiHandlers).toContain(handler);
    expect(api.apiHandlers).toHaveLength(1);
    expect(() => api.addAPIHandler(handler)).not.toThrow();
    expect(api.apiHandlers).toHaveLength(1);
  });
});

describe('removeAPIHandler', () => {
  let app = new DummyApp();
  let { server } = app;

  it('should require a real APIHandler', () => {
    let api = new ServerAPI(server);
    let handler = new DummyAPIHAndler();
    expect(() => api.removeAPIHandler(null)).toThrow();
    expect(() => api.removeAPIHandler(handler)).not.toThrow();
  });

  it('should remove an item', () => {
    let api = new ServerAPI(server);
    let handler1 = new DummyAPIHAndler();
    let handler2 = new DummyAPIHAndler();
    api.addAPIHandler(handler1);
    api.addAPIHandler(handler2);
    expect(api.apiHandlers).toHaveLength(2);
    expect(api.apiHandlers).toContain(handler1);
    expect(api.apiHandlers).toContain(handler2);

    api.removeAPIHandler(handler1);
    expect(api.apiHandlers).toHaveLength(1);
    expect(api.apiHandlers).not.toContain(handler1);
    expect(api.apiHandlers).toContain(handler2);

    api.removeAPIHandler(handler1);
    expect(api.apiHandlers).toHaveLength(1);
    expect(api.apiHandlers).not.toContain(handler1);
    expect(api.apiHandlers).toContain(handler2);
  });
});

describe('getAPIHandlerFromMethodAndPath', () => {
  let app = new DummyApp();
  let api = new ServerAPI(app.server);
  let handler1 = new DummyAPIHAndler('GET', '/test1');
  let handler2 = new DummyAPIHAndler('GET', ['/test2', '/test2a']);
  let handler3 = new DummyAPIHAndler(['GET','POST'], '/test3');
  let handler4 = new DummyAPIHAndler(['GET','POST'], ['/test4', '/test4a']);
  [handler1,handler2,handler3,handler4].forEach(e => api.addAPIHandler(e));

  it('should return the correct handler', () => {
    expect(api.getAPIHandlerFromMethodAndPath('GET', '/test1')).toEqual(handler1);

    expect(api.getAPIHandlerFromMethodAndPath('GET', '/test2')).toEqual(handler2);
    expect(api.getAPIHandlerFromMethodAndPath('GET', '/test2')).toEqual(handler2);
    expect(api.getAPIHandlerFromMethodAndPath('GET', '/test2a')).toEqual(handler2);

    expect(api.getAPIHandlerFromMethodAndPath('GET', '/test3')).toEqual(handler3);
    expect(api.getAPIHandlerFromMethodAndPath('POST', '/test3')).toEqual(handler3);

    expect(api.getAPIHandlerFromMethodAndPath('POST', '/test4')).toEqual(handler4);
    expect(api.getAPIHandlerFromMethodAndPath('GET', '/test4')).toEqual(handler4);
    expect(api.getAPIHandlerFromMethodAndPath('POST', '/test4a')).toEqual(handler4);
    expect(api.getAPIHandlerFromMethodAndPath('GET', '/test4a')).toEqual(handler4);
  });

  it('should return null if the method and path dont match', () => {
    expect(api.getAPIHandlerFromMethodAndPath('POST', '/test1')).toBeNull();
    expect(api.getAPIHandlerFromMethodAndPath('POST', '/test20')).toBeNull();
    expect(api.getAPIHandlerFromMethodAndPath('PUT', '/test2')).toBeNull();
    expect(api.getAPIHandlerFromMethodAndPath('GET', '/test4b')).toBeNull();
  });
});
