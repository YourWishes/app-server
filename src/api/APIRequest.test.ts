import { APIHandler, APIResponse, APIRequest } from './';
import { App } from '@yourwishes/app-base';
import { IServerApp } from './../app/';
import { ServerModule } from './../module/ServerModule';

class DummyApp extends App implements IServerApp {
  server:ServerModule;
}

const app = new DummyApp();
const server = new ServerModule(app);
const req:any = {
  body: {
    lorem: 'ipsum',
    dolor: {
      sit: 'amet'
    },
    that: {
      was: {
        deep: 'Yeah I know'
      }
    },
    boolTrue: 'true',
    boolFalse: 'false',
    userId: '123910',
    balance: '456.112345',
    blank: ''
  },

  query: {
    id: '125',
    accepted: 'checked',
    balance: '7896.457',
    cars: [
      'Saab', 'Audi'
    ],
    empty: ''
  }
};

describe('APIRequest', () => {
  it('should be constructable', () => {
    expect(() => new APIRequest(server, 'GET', '/test', req)).not.toThrow();
  });

  it('should require a real server module', () => {
    expect(() => new APIRequest(null, 'GET', '/test', req)).toThrow();
  });

  it('should require a real request', () => {
    expect(() => new APIRequest(server, 'GET', '/test', null)).toThrow();
  });
});

describe('getData', () => {
  it('should return the body out of the request', () => {
    let request = new APIRequest(server, 'POST', '/test', req);
    expect(request.getData()).toStrictEqual(req.body);
  });

  it('should return the query from a GET request', () => {
    let request = new APIRequest(server, 'GET', '/test', req);
    expect(request.getData()).not.toEqual(req.body);
    expect(request.getData()).toStrictEqual(req.query);
  });
});

describe('isStringTrue', () => {
  let request = new APIRequest(server, 'GET', '/test', req);

  it('should return things that appear to be truthy as true', () => {
    expect(request.isStringTrue('true')).toStrictEqual(true);
    expect(request.isStringTrue('1')).toStrictEqual(true);
    expect(request.isStringTrue('checked')).toStrictEqual(true);
    expect(request.isStringTrue('yes')).toStrictEqual(true);
  });

  it('should return things that DONT appear truthy as false', () => {
    expect(request.isStringTrue('false')).toStrictEqual(false);
    expect(request.isStringTrue('0')).toStrictEqual(false);
    expect(request.isStringTrue('')).toStrictEqual(false);
    expect(request.isStringTrue('null')).toStrictEqual(false);
    expect(request.isStringTrue('no')).toStrictEqual(false);
  });
});


describe('get', () => {
  let rPost = new APIRequest(server, 'POST', '/test', req);
  let rGet = new APIRequest(server, 'GET', '/test', req);

  it('should return the entire data if no key is provided', () => {
    expect(rPost.get()).toStrictEqual(req.body);
    expect(rGet.get()).toStrictEqual(req.query);
  });

  it('should return the items from the key', () => {
    expect(rPost.get('lorem')).toStrictEqual('ipsum');
    expect(rPost.get('dolor.sit')).toStrictEqual('amet');
    expect(rPost.get('boolTrue')).toStrictEqual('true');
    expect(rPost.get('that.was.deep')).toStrictEqual('Yeah I know');

    expect(rGet.get('id')).toStrictEqual('125');
    expect(rGet.get('accepted')).toStrictEqual('checked');
    expect(rGet.get('cars')).toStrictEqual(req.query.cars);
  });

  it('should return null if the key was not found', () => {
    expect(rPost.get('test')).toBeNull();
    expect(rPost.get('dolor.test')).toBeNull();
    expect(rPost.get('accepted')).toBeNull();

    expect(rGet.get('test')).toBeNull();
    expect(rGet.get('test2')).toBeNull();
  });
});

describe('getRecursive', () => {
  let request = new APIRequest(server, 'POST', '/test', req);

  it('should return the item from the data object by using the keys in the array', () => {
    expect( request.getRecursive(['lorem'], { lorem: 'ipsum' }) ).toStrictEqual('ipsum');
    expect( request.getRecursive(['lorem', 'ipsum'], { lorem: { ipsum: 'dolor' } }) ).toStrictEqual('dolor');
    expect( request.getRecursive(['lorem', 'ipsum'], { lorem: { ipsum: { dolor: 'sit' } } }) ).toStrictEqual({ dolor: 'sit' });
  });

  it('should return null if no data object is provided', () => {
    expect( request.getRecursive(['lorem']) ).toBeNull();
    expect( request.getRecursive(['lorem', 'ipsum'],{}) ).toBeNull();
  });
});

describe('has', () => {
  let rPost = new APIRequest(server, 'POST', '/test', req);
  let rGet = new APIRequest(server, 'GET', '/test', req);

  it('should return true if the key is in the data', () => {
    expect(rPost.has('lorem')).toEqual(true);
    expect(rPost.has('dolor')).toEqual(true);
    expect(rPost.has('dolor.sit')).toEqual(true);
    expect(rPost.has('that.was')).toEqual(true);

    expect(rGet.has('id')).toEqual(true);
    expect(rGet.has('accepted')).toEqual(true);
    expect(rGet.has('balance')).toEqual(true);
    expect(rGet.has('cars')).toEqual(true);
  });

  it('should return false if the key is not in the data', () => {
    expect(rPost.has('no')).toEqual(false);
    expect(rPost.has('dolor.lorem')).toEqual(false);
    expect(rPost.has('cars')).toEqual(false);

    expect(rGet.has('false')).toEqual(false);
    expect(rGet.has('lorem')).toEqual(false);
  });
});

describe('hasRecursive', () => {
  let r = new APIRequest(server, 'POST', '/test', req);

  it('should return true if the keys exist in the data object', () => {
    expect( r.hasRecursive(['lorem'], { lorem: 'ipsum' }) ).toStrictEqual(true);
    expect( r.hasRecursive(['lorem', 'ipsum'], { lorem: { ipsum: 'dolor' } }) ).toStrictEqual(true);
    expect( r.hasRecursive(['lorem', 'ipsum'], { lorem: { ipsum: { dolor: 'sit' } } }) ).toStrictEqual(true);
  });

  it('should return true if the keys exist in the data object', () => {
    expect( r.hasRecursive(['lorem']) ).toStrictEqual(false);
    expect( r.hasRecursive(['lorem', 'ipsum'],{}) ).toStrictEqual(false);
  });
});


describe('getInteger', () => {
  let rPost = new APIRequest(server, 'POST', '/test', req);
  let rGet = new APIRequest(server, 'GET', '/test', req);

  it('should get an integer', () => {
    expect(rPost.getInteger('userId')).toStrictEqual(123910);
    expect(rGet.getInteger('id')).toStrictEqual(125);
  });

  it('should throw an error if it is not an integer', () => {
    expect(() => rPost.getInteger('lorem')).toThrow();
    expect(() => rPost.getInteger('balance')).toThrow();
    expect(() => rPost.getInteger('missing')).toThrow();

    expect(() => rGet.getInteger('accepted')).toThrow();
    expect(() => rGet.getInteger('balance')).toThrow();
    expect(() => rGet.getInteger('missing')).toThrow();
  });
});

describe('getDouble', () => {
  let rPost = new APIRequest(server, 'POST', '/test', req);
  let rGet = new APIRequest(server, 'GET', '/test', req);

  it('should get a double', () => {
    expect(rPost.getDouble('userId')).toStrictEqual(123910);
    expect(rPost.getDouble('balance')).toStrictEqual(456.112345);
    expect(rGet.getDouble('id')).toStrictEqual(125);
    expect(rGet.getDouble('balance')).toStrictEqual(7896.457);
  });

  it('should throw an error if the value is not a double', () => {
    expect(() => rPost.getDouble('lorem')).toThrow();
    expect(() => rPost.getDouble('dolor.sit')).toThrow();
    expect(() => rPost.getDouble('boolTrue')).toThrow();

    expect(() => rGet.getDouble('accepted')).toThrow();
    expect(() => rGet.getDouble('cars')).toThrow();
  });
});

describe('getBool', () => {
  let rPost = new APIRequest(server, 'POST', '/test', req);
  let rGet = new APIRequest(server, 'GET', '/test', req);

  it('should return a boolean matching true or false', () => {
    expect(rPost.getBool('boolTrue')).toStrictEqual(true);
    expect(rPost.getBool('boolFalse')).toStrictEqual(false);
    expect(rGet.getBool('accepted')).toStrictEqual(true);
  });

  it('should throw if the value is not truey or falsey', () => {
    expect(() => rPost.getBool('lorem')).toThrow();
    expect(() => rPost.getBool('dolor.sit')).toThrow();
    expect(() => rGet.getBool('id')).toThrow();
    expect(() => rGet.getBool('cars')).toThrow();
  });
});

describe('getString', () => {
  let rPost = new APIRequest(server, 'POST', '/test', req);
  let rGet = new APIRequest(server, 'GET', '/test', req);

  it('should return the string out of the data', () => {
    expect(rPost.getString('lorem', 64)).toStrictEqual('lorem');
    expect(rPost.getString('dolor.sit', 64)).toStrictEqual('amet');
    expect(rPost.getString('that.was.deep', 64)).toStrictEqual('Yeah I know');

    expect(rGet.getString('accepted', 64)).toStrictEqual('accepted');
    expect(rGet.getString('blance', 64)).toStrictEqual('7896.457');
  });

  it('should check the maxLength against the string', () => {
    expect(() => rPost.getString('lorem', 5)).not.toThrow();
    expect(() => rPost.getString('lorem', 3)).toThrow();
    expect(() => rPost.getString('dolor.sit', 3)).toThrow();
    expect(() => rPost.getString('that.was.deep', 3)).toThrow();

    expect(() => rGet.getString('accepted', 7)).not.toThrow();
    expect(() => rGet.getString('accepted', 6)).toThrow();
  });

  it('should throw if the string isnt in the object', () => {
    expect(() => rPost.getString('test', 64)).toThrow();
    expect(() => rPost.getString('test2', 64)).toThrow();

    expect(() => rGet.getString('test', 64)).toThrow();
    expect(() => rGet.getString('test4', 64)).toThrow();
  });

  it('should disallow empty strings if allowBlank', () => {
    expect(() => rPost.getString('blank', 32)).toThrow();
    expect(rPost.getString('blank', 32, true)).toStrictEqual('');

    expect(() => rGet.getString('empty', 32)).toThrow();
    expect(rGet.getString('empty', 32, true)).toStrictEqual('');
  });
});


describe('hasInteger', () => {
  let rPost = new APIRequest(server, 'POST', '/test', req);
  let rGet = new APIRequest(server, 'GET', '/test', req);

  it('should return true if the item is an integer', () => {
    expect(rPost.hasInteger('userId')).toStrictEqual(true);
    expect(rGet.hasInteger('id')).toStrictEqual(true);
  });

  it('return false if the item is not a double', () => {
    expect(rPost.hasInteger('lorem')).toStrictEqual(false);
    expect(rPost.getInteger('balance')).toStrictEqual(false);
    expect(rPost.getInteger('missing')).toStrictEqual(false);

    expect(rGet.getInteger('accepted')).toStrictEqual(false);
    expect(rGet.getInteger('balance')).toStrictEqual(false);
    expect(rGet.getInteger('missing')).toStrictEqual(false);
  });
});

describe('hasDouble', () => {
  let rPost = new APIRequest(server, 'POST', '/test', req);
  let rGet = new APIRequest(server, 'GET', '/test', req);

  it('should return true if the item is a double', () => {
    expect(rPost.hasDouble('userId')).toStrictEqual(true);
    expect(rPost.hasDouble('balance')).toStrictEqual(true);
    expect(rGet.hasDouble('id')).toStrictEqual(true);
    expect(rGet.hasDouble('balance')).toStrictEqual(true);
  });

  it('return false if the item is not a double', () => {
    expect(rPost.getDouble('lorem')).toStrictEqual(false);
    expect(rPost.getDouble('dolor.sit')).toStrictEqual(false);
    expect(rPost.getDouble('boolTrue')).toStrictEqual(false);

    expect(rGet.getDouble('accepted')).toStrictEqual(false);
    expect(rGet.getDouble('cars')).toStrictEqual(false);
  });
});

describe('hasBool', () => {
  let rPost = new APIRequest(server, 'POST', '/test', req);
  let rGet = new APIRequest(server, 'GET', '/test', req);

  it('return true if the item is a bool', () => {
    expect(rPost.hasBool('boolTrue')).toStrictEqual(true);
    expect(rPost.hasBool('boolFalse')).toStrictEqual(true);
    expect(rGet.hasBool('accepted')).toStrictEqual(true);
  });

  it('return false if the item is not a bool', () => {
    expect(rPost.getBool('lorem')).toStrictEqual(false);
    expect(rPost.getBool('dolor.sit')).toStrictEqual(false);
    expect(rGet.getBool('id')).toStrictEqual(false);
    expect(rGet.getBool('cars')).toStrictEqual(false);
  });
});

describe('hasString', () => {
  let rPost = new APIRequest(server, 'POST', '/test', req);
  let rGet = new APIRequest(server, 'GET', '/test', req);

  it('return true if the string is in the data', () => {
    expect(rPost.hasString('lorem', 64)).toStrictEqual(true);
    expect(rPost.hasString('dolor.sit', 64)).toStrictEqual(true);
    expect(rPost.hasString('that.was.deep', 64)).toStrictEqual(true);

    expect(rGet.getString('accepted', 64)).toStrictEqual(true);
    expect(rGet.getString('blance', 64)).toStrictEqual(true);
  });

  it('should return false if the string length exceeds max length', () => {
    expect(rPost.getString('lorem', 5)).toStrictEqual(false);
    expect(rPost.getString('lorem', 3)).toStrictEqual(false);
    expect(rPost.getString('dolor.sit', 3)).toStrictEqual(false);
    expect(rPost.getString('that.was.deep', 3)).toStrictEqual(false);

    expect(rGet.getString('accepted', 7)).toStrictEqual(false);
    expect(rGet.getString('accepted', 6)).toStrictEqual(false);
  });

  it('return false if the string isnt in the object', () => {
    expect(rPost.getString('test', 64)).toStrictEqual(false);
    expect(rPost.getString('test2', 64)).toStrictEqual(false);

    expect(rGet.getString('test', 64)).toStrictEqual(false);
    expect(rGet.getString('test4', 64)).toStrictEqual(false);
  });

  it('return true for empty strings if they are allowed, false if they arent', () => {
    expect(rPost.getString('blank', 32)).toStrictEqual(false);
    expect(rPost.getString('blank', 32, true)).toStrictEqual(true);

    expect(rGet.getString('empty', 32)).toStrictEqual(false);
    expect(rGet.getString('empty', 32, true)).toStrictEqual(true);
  });
});
