import { APIHandler, APIResponse, APIRequest } from './';

class DummyHandler extends APIHandler {
  request:jest.Mock;

  async onRequest(request: APIRequest):Promise<APIResponse> {
    return this.request();
  }
}


describe('APIRequest', () => {
  it('should be constructable with an array of methods and paths', () => {
    expect(() => new DummyHandler(['GET', 'POST'], ['/test', '/test2'])).not.toThrow();
  });

  it('should be constructable with strings instead of arrays for params', () => {
    expect(() => new DummyHandler('GET', '/test')).not.toThrow();
    expect(() => new DummyHandler(['GET','POST'], '/test')).not.toThrow();
    expect(() => new DummyHandler('GET', ['/test', '/test2'])).not.toThrow();
  });

  it('should only allow strings for the methods and paths', () => {
    expect(() => new DummyHandler(null, '/test')).toThrow();
    expect(() => new DummyHandler(['GET',null], '/test')).toThrow();
    expect(() => new DummyHandler(['GET','POST'], [null, '/test'])).toThrow();
    expect(() => new DummyHandler('POST', [null, '/test'])).toThrow();
    expect(() => new DummyHandler('POST', null)).toThrow();
  });
});

describe('hasPath', () => {
  let handler1 = new DummyHandler('GET', '/test1');
  let handler2 = new DummyHandler('GET', '/test2');
  let handler3 = new DummyHandler('GET', ['/test3','/test4']);

  it('should return true if the path matches', () => {
    expect(handler1.hasPath('/test1')).toEqual(true);
    expect(handler2.hasPath('/test2')).toEqual(true);
    expect(handler3.hasPath('/test3')).toEqual(true);
    expect(handler3.hasPath('/test4')).toEqual(true);
  });

  it('shoud return false if the path does not match', () => {
    expect(handler1.hasPath('/test2')).toEqual(false);
    expect(handler2.hasPath('/test1')).toEqual(false);
    expect(handler3.hasPath('/test2')).toEqual(false);
    expect(handler3.hasPath('/test1')).toEqual(false);
  });
});

describe('hasMethod', () => {
  let handler1 = new DummyHandler('GET', '/test');
  let handler2 = new DummyHandler('POST', '/test');
  let handler3 = new DummyHandler(['GET', 'POST'], '/test');

  it('should return true if it has the method', () => {
    expect(handler1.hasMethod('GET')).toEqual(true);
    expect(handler2.hasMethod('POST')).toEqual(true);
    expect(handler3.hasMethod('get')).toEqual(true);
    expect(handler3.hasMethod('post')).toEqual(true);
  });

  it('should return falsae if it does not have the module', () => {
    expect(handler1.hasMethod('POST')).toEqual(false);
    expect(handler2.hasMethod('GET')).toEqual(false);
    expect(handler3.hasMethod('PUT')).toEqual(false);
  });
});
