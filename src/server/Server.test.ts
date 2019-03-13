import { App } from '@yourwishes/app-base';
import {
  IServerApp, ServerModule, Server
} from './../';

import * as fs from 'fs';

class DummyApp extends App implements IServerApp {
  server:ServerModule;
  constructor() {
    super();

    this.server = new ServerModule(this);
    this.modules.addModule(this.server);
  }
}


//FS overrides
const existsOriginal = fs.existsSync;
const readFileOriginal:any = fs.readFileSync;

const existsFile = (e) => fs[`existsSync${''}`] = e;
const readFile = (e) => fs[`readFileSync${''}`] = e;
const restoreFile = () => {
  fs[`existsSync${''}`] = existsOriginal;
  fs[`readFileSync${''}`] = readFileOriginal;
};

//Fake key/cert
/*** IMPORTANT: These are TEST ONLY and are NOT VALID OR SECURE!!! ***/
const key = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAuzfGOdV5oeM7cdY7TwAiUufzkAERcFxujhUDmVgSUKyreo0q
ZshytvUh+t8VxihTN1JEB4hTNRndf7BipClGT2/WL+1+addF/HEhD1LtsM8zqqdn
PmxMgSxbGm5ZYlD7LE9tk0APaaBPwul63lBPKStgyt91sPxawzfoS2k9EvcRk0m3
AgkMlkL1lu45EGUp0qBsqUgfq6sdbwlH39IGoqU6LTAxCuxK56V+axfSZ5En+0cp
pK9NQt5t4EUXMqI7pegBpAL0Z/8urBTLLDn55nba2lZ6+JA8+NwiYo3FTEFuytNZ
0KuG/C/1W2l+6vxuTVABB9cnDi9IFxemX8qscwIDAQABAoIBAGl6G+Ebh4KQnj4d
f56bqbrh2ZRJNcUDHnpIFpX/S5pOHfJWtAviZNb1Nqa7pu3UbEXfwFoqEQ76upMl
Ef4BDw7UKG0qNa11zoVSS1jx1N5nbml4FS/THissjUtP3mYIz+n/+fEbB1PwMN/U
YRf9UQwV11uVGB6VnqEbz3ElInaa6gtj3taOp2LdGEZk8X700asPdnM6+YdxBMrC
07yL1ZbbOrHE7nsiB3EDDQf1NkL9p0IiI3gz+zIdgr6qT8u4csBKUEDcZA3wXS4j
QiEs0B0TtB20Ie6fUOA4eYHZKr2c3LlduhLKuR3r3XLkkxu+W6Kk+LJh5TQWaeiL
wyFqHWECgYEA9GIc3wkgusHd3wfnwOM11jzyO44dCevpR3n7qJ/zNq0PFaiv3PqL
KQERRp9vuFCCxUWqA0eyD4bm4BGsFmW7BcmoOjfzCxdOMHW0sLOAOTXzezreWzB0
p96e4qunajChL/80eSmfZuRDeDzMvuoMwfEURGGkStcNKAi8gwxP9xECgYEAxB4E
1/SZNeYHrJYE/k9LdSuwf0EHQxOOhwI8dBDmYCzTY1Vu8dpIKxufYySMI2Eco4mn
WDm64uEFVqFWHSodB9wBip9UbWSoEagu6pgEJUBlMPq+upypYwFd7XnMagXoEouR
NXi0zrLLShBn3Mgij7m9PFFC1KFh8JVvC76a00MCgYEAuScggqbSwkwhglnl71D1
uBRC3nZEcADppDq6PT66MUGavSkp3L2B85YYda5UIYv2F+o47fVC5dqqTzd0bx+y
O6dWKo27OTr2BWcYeAv3aOEEUOgAEYy7xXe4Xzn4RE8FwGyVX/r2BymIKK+/3CFN
ex7g4RItPHqEQEGmOY95glECgYEAmHpmdakc/cTtLogtNbRdDKp9PVNH3CT2aY2Z
hvwkwZ3YdKDV84AtICcH00N1GYTFiXja/UNVRFSDnAkwNNirXZL2N9sM/0iFS8Uh
RRAQGQ5qHpy1cc2f/PPxHVPXVI9nEhQlQBerLBHi8KC0v/lytaBJuv3LIhqfVTg5
8D2vjpUCgYAXau+3f32kForu9IMwG9+PzqdIlh17/XIjlg9dDAXoO04pmTYIxzLy
rXMFI3VbArk8I58FlLiB/6q1zRTS135Ktr+tDVnxHpYQZnzQVFFdsfngEukVPhNp
HK2mGMlElBpWfBd5M2BHL7wC266a8y5VYoHC/KshsHWu3Fv5xssQQw==
-----END RSA PRIVATE KEY-----`;

const cert = `-----BEGIN CERTIFICATE-----
MIIC8TCCAdmgAwIBAgIJAJKk9DT4HeVtMA0GCSqGSIb3DQEBBQUAMA8xDTALBgNV
BAMMBHRlc3QwHhcNMTkwMTA2MDYyMzIwWhcNMjkwMTAzMDYyMzIwWjAPMQ0wCwYD
VQQDDAR0ZXN0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuzfGOdV5
oeM7cdY7TwAiUufzkAERcFxujhUDmVgSUKyreo0qZshytvUh+t8VxihTN1JEB4hT
NRndf7BipClGT2/WL+1+addF/HEhD1LtsM8zqqdnPmxMgSxbGm5ZYlD7LE9tk0AP
aaBPwul63lBPKStgyt91sPxawzfoS2k9EvcRk0m3AgkMlkL1lu45EGUp0qBsqUgf
q6sdbwlH39IGoqU6LTAxCuxK56V+axfSZ5En+0cppK9NQt5t4EUXMqI7pegBpAL0
Z/8urBTLLDn55nba2lZ6+JA8+NwiYo3FTEFuytNZ0KuG/C/1W2l+6vxuTVABB9cn
Di9IFxemX8qscwIDAQABo1AwTjAdBgNVHQ4EFgQUDt4bpmt0ycCChjsRDc7mMuQ2
CXgwHwYDVR0jBBgwFoAUDt4bpmt0ycCChjsRDc7mMuQ2CXgwDAYDVR0TBAUwAwEB
/zANBgkqhkiG9w0BAQUFAAOCAQEACtEeXDJ/BCJ159mks9FG6EWPlF5pS8OeHBto
v1/vVvJcGCSB63zQsNa/ttYgVrxqLdpC1MHxZU21UrD0tK71iqMNBClqc2te1h0G
SFVtaaVEC4OXlvDhfLxlR5AYDXr5azSsZ+zwkuXH8U+RIL/pxvBhXaOdpfhLrXcs
YaJDWoO4pClqrINzni0hNycMAD8QJZ2mS/70EnJpOxznIEtIRy5FUFYhKH/5k+2S
2EdvvpJPlF7QM/C5p7XmUT/HrYoc0WYUKZVbNsLQN945QMIUbjFGSdCYISju8TbI
lEnrJ3eJnNHWERtJX0q1S0+yBeatHiAEuzOfRd9liWKXeoTqJA==
-----END CERTIFICATE-----`;


//For testing, we're setting autoStart to false.
const makeModule = (config:object={}) => {
  let app = new DummyApp();
  app.server.autoStart = false;
  app.config.data = { server: config };
  return app.server;
};

const makeServer = (config:object={}) => {
  return makeModule(config).server;
};


describe('Server', () => {
  it('should require a valid server module', () => {
    expect(() => new Server(null)).toThrow();
    expect(() => new Server(undefined)).toThrow();
  });

  it('should construct', () => {
    expect(() => new Server(new DummyApp().server)).not.toThrow();
  });
});



describe('init', () => {
  /*** Reading the IP Address Tests ***/
  const ipConfig = async (ip:string) => {
    let server = makeServer({ ip });
    await server.init();
    return server;
  };

  it('should bind to the ip in the configuration', async () => {
    let server = await ipConfig('1.1.1.1');
    expect(server.ip).toEqual('1.1.1.1');
  });

  it('should read from config with both ipv4 and ipv6 addresses', async () => {
    let server = await ipConfig('7b4e:386:905f:a67d:d83b:69b:b003:584');
    expect(server.ip).toEqual('7b4e:386:905f:a67d:d83b:69b:b003:584');
    server = await ipConfig('2.1.2.1');
    expect(server.ip).toEqual('2.1.2.1');
  });

  it('should only allow valid ip addresses', async () => {
    await expect(ipConfig('498.1.2.3')).rejects.toThrow();
    await expect(ipConfig('1.1.1.256')).rejects.toThrow();

    await expect(ipConfig('7b4e:386:905f:a67d:d83b:69b:b003:584g')).rejects.toThrow();
    await expect(ipConfig('ffbff:dc2b:51a4:bbf9:8053:faf2:83f7:6e9c')).rejects.toThrow();

    await expect(ipConfig('abcdef')).rejects.toThrow();
    await expect(ipConfig('123456')).rejects.toThrow();
    await expect(ipConfig('ab8i9')).rejects.toThrow();
  });

  it('should default the ip to null', async () => {
    let server = makeServer();
    await server.init();
    expect(server.ip).toBeNull();
  });

  /*** Reading the port Address Tests ***/
  const portConfig = async (port:string) => {
    let server = makeServer({ port });
    await server.init();
    return server;
  }

  it('should bind to the port in the configuration', async () => {
    let server = await portConfig('21');
    expect(server.port).toEqual(21);

    server = await portConfig('25565');
    expect(server.port).toEqual(25565);

    server = await portConfig('65535');
    expect(server.port).toEqual(65535);

    server = await portConfig('00004');
    expect(server.port).toEqual(4);
  });

  it('should throw an error for invalid ports', async () => {
    await expect(portConfig('-1')).rejects.toThrow();
    await expect(portConfig('65536')).rejects.toThrow();
    await expect(portConfig('99999999')).rejects.toThrow();
    await expect(portConfig('apples')).rejects.toThrow();
  });

  it('should default to port 80', async () => {
    let server = makeServer();
    await server.init();
    expect(server.port).toEqual(80);
  });


  /*** HTTP ***/
  it('should create an express wrapper', async () => {
    let server = makeServer();
    await server.init();
    expect(server.express).toBeDefined();
  });

  it('should create a HTTP Server', async () => {
    let server = makeServer();
    await server.init();
    expect(server.http).toBeDefined();
  });

  /*** HTTPS ***/
  const secureConfig = async (secure:object) => {
    let server = makeServer({ secure: secure });
    await server.init();
    return server;
  };
  const sslConfig = { key: 'keyFile', cert: 'certFile' };

  it('should attempt to start HTTPS if the config has the secure key in it', async () => {
    //An error will still throw since it's going to immediately expect the SSL key to be set.
    await expect(secureConfig({ })).rejects.toThrow('Missing SSL Key file path in Configuration.');
  });

  //Key / Cert testing
  it('should require the SSL Key file path to be set.', async () => {
    await expect(secureConfig({ })).rejects.toThrow();
  });

  it('should require the SSL Certificate file path to be set.', async () => {
    await expect( secureConfig({ key: 'keyFile' }) ).rejects.toThrow();
  });

  it('should throw if the cert or key files don\'t exist', async () => {
    existsFile(() => false);
    await expect(secureConfig(sslConfig)).rejects.toThrow('SSL Key file was not found');

    existsFile((s:string) => s.indexOf('keyFile') !== -1);
    await expect(secureConfig(sslConfig)).rejects.toThrow('SSL Certificate file was not found');

    //Restore mocks
    restoreFile();
  });

  it('should require the key and certificate files to not be empty.', async () => {
    existsFile((s:string) => true);
    readFile((s:string) => '');
    await expect(secureConfig(sslConfig)).rejects.toThrow();

    readFile((s:string) => {
      if(s.indexOf('keyFile') !== -1) return 'Key';
      return '';
    });
    await expect(secureConfig(sslConfig)).rejects.toThrow();
    restoreFile();
  });

  it('should allow and validate the custom https port', async () => {
    existsFile(() => true);
    const portError = 'Invalid HTTPS Port in Server Configuration.';

    await expect(secureConfig({...sslConfig, port: 'a'})).rejects.toThrow(portError);
    await expect(secureConfig({...sslConfig, port: '-1'})).rejects.toThrow(portError);
    await expect(secureConfig({...sslConfig, port: '65536'})).rejects.toThrow(portError);
    await expect(secureConfig({...sslConfig, port: 'a123'})).rejects.toThrow(portError);
    await expect(secureConfig({...sslConfig, port: '80'})).rejects.not.toThrow(portError);
    await expect(secureConfig({...sslConfig, port: '1234'})).rejects.not.toThrow(portError);

    //One to confirm it's actually using the port config
    let server = makeServer({
      secure: { key: 'keyFile', cert: 'certFile', port: '7654' }
    });
    await expect(server.init()).rejects.not.toThrow(portError);
    expect(server.httpsPort).toStrictEqual(7654);

    restoreFile();
  });

  it('should read the cert and key files, and default the https port to 443', async () => {
    existsFile((s:string) => true);
    readFile((s:string, a, b, c, d, e, f) => {
      if(s.indexOf('keyFile') !== -1) return key;
      if(s.indexOf('certFile') !== -1) return cert;
      //Since for some reason it seems https is reading something from files?
      return readFileOriginal(s,a,b,c,d,e,f);
    });

    let server = await secureConfig(sslConfig);

    expect(server.ssl).toStrictEqual(true);
    expect(server.key).toStrictEqual(key);
    expect(server.cert).toStrictEqual(cert);
    expect(server.https).toBeDefined();
    expect(server.httpsPort).toEqual(443);
    restoreFile();
  });
});

describe('start', () => {
  it('should try and listen on the port', async () => {
    let server = makeServer();
    await server.init();

    let originalListen = server.http.listen;
    let mock = jest.fn();
    server.http[`listen${''}`] = mock;

    await expect(server.start()).resolves.not.toThrow();
    expect(mock).toHaveBeenCalled();

    server.http[`listen${''}`] = originalListen;
  });
});
