import { App } from '@yourwishes/app-base';
import { ServerModule, IServerApp } from './../';

class DummyApp extends App implements IServerApp {
  server:ServerModule;
}

describe('ServerModule', () => {
  it('should be constructable', () => {
    let app = new DummyApp();
    expect(() => new ServerModule(app)).not.toThrow();
  });

  it('should create the server and api submodules', () => {
    let module = new ServerModule(new DummyApp());
    expect(module.server).toBeDefined();
    expect(module.api).toBeDefined();

    expect(module.server).not.toBeNull();
    expect(module.api).not.toBeNull();
  });
});

describe('loadPackage', () => {
  it('should load and return the correct information about the package', () => {
    let module = new ServerModule(new DummyApp());
    expect(module.package).toHaveProperty('name', '@yourwishes/app-server');
  });
});
