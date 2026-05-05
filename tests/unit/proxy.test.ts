import test from 'node:test';
import assert from 'node:assert/strict';

import {
  installGlobalProxySupport,
  resetProxySupportForTests,
} from '../../src/config/proxy.js';

test.afterEach(() => {
  resetProxySupportForTests();
});

test('installGlobalProxySupport is a no-op when no proxy env is set', () => {
  let calls = 0;

  const installed = installGlobalProxySupport({
    env: {},
    runtime: {
      EnvHttpProxyAgent: class {},
      setGlobalDispatcher() {
        calls += 1;
      },
      readFileSync() {
        throw new Error('should not be called');
      },
    },
    logger: {
      info() {},
    },
  });

  assert.equal(installed, false);
  assert.equal(calls, 0);
});

test('installGlobalProxySupport installs a global dispatcher from proxy env', () => {
  let calls = 0;
  let dispatcher: unknown = null;
  const messages: string[] = [];
  let constructorOptions: unknown = null;

  const installed = installGlobalProxySupport({
    env: {
      HTTPS_PROXY: 'http://proxy.internal:8080',
    },
    runtime: {
      EnvHttpProxyAgent: class FakeProxyAgent {
        constructor(options?: unknown) {
          constructorOptions = options ?? null;
        }

        readonly kind = 'env-proxy-agent';
      },
      setGlobalDispatcher(value) {
        calls += 1;
        dispatcher = value;
      },
      readFileSync() {
        throw new Error('should not be called');
      },
    },
    logger: {
      info(message) {
        messages.push(message);
      },
    },
  });

  assert.equal(installed, true);
  assert.equal(calls, 1);
  assert.equal(
    (dispatcher as { kind?: string } | null)?.kind,
    'env-proxy-agent',
  );
  assert.deepEqual(constructorOptions, {
    noProxy: undefined,
    proxyTls: undefined,
    requestTls: undefined,
  });
  assert.match(messages[0] ?? '', /Installed global proxy dispatcher/);
});

test('installGlobalProxySupport wires trust bundle into proxy and request TLS', () => {
  let dispatcher: unknown = null;
  let constructorOptions: unknown = null;

  installGlobalProxySupport({
    env: {
      HTTPS_PROXY: 'https://proxy.internal:8443',
      NODE_EXTRA_CA_CERTS: '/tmp/proxy-ca.pem',
    },
    runtime: {
      EnvHttpProxyAgent: class FakeProxyAgent {
        constructor(options?: unknown) {
          constructorOptions = options ?? null;
        }
      },
      setGlobalDispatcher(value) {
        dispatcher = value;
      },
      readFileSync(path, encoding) {
        assert.equal(path, '/tmp/proxy-ca.pem');
        assert.equal(encoding, 'utf8');
        return 'CERTIFICATE_DATA';
      },
    },
    logger: {
      info() {},
    },
  });

  assert.ok(dispatcher);
  assert.deepEqual(constructorOptions, {
    noProxy: undefined,
    proxyTls: {
      ca: 'CERTIFICATE_DATA',
    },
    requestTls: {
      ca: 'CERTIFICATE_DATA',
    },
  });
});

test('installGlobalProxySupport passes uppercase NO_PROXY explicitly to undici', () => {
  let constructorOptions: unknown = null;

  installGlobalProxySupport({
    env: {
      HTTPS_PROXY: 'https://proxy.internal:8443',
      NO_PROXY: 'localhost,aws.s2.dev,salambo-demo.b.aws.s2.dev',
    },
    runtime: {
      EnvHttpProxyAgent: class FakeProxyAgent {
        constructor(options?: unknown) {
          constructorOptions = options ?? null;
        }
      },
      setGlobalDispatcher() {},
      readFileSync() {
        throw new Error('should not be called');
      },
    },
    logger: {
      info() {},
    },
  });

  assert.deepEqual(constructorOptions, {
    noProxy: 'localhost,aws.s2.dev,salambo-demo.b.aws.s2.dev',
    proxyTls: undefined,
    requestTls: undefined,
  });
});


test('installGlobalProxySupport merges lowercase no_proxy before uppercase NO_PROXY', () => {
  let constructorOptions: unknown = null;

  installGlobalProxySupport({
    env: {
      HTTPS_PROXY: 'https://proxy.internal:8443',
      NO_PROXY: 'localhost,127.0.0.1,::1,otel-collector.app.daytona.io',
      no_proxy: 'aws.s2.dev,salambo-demo.b.aws.s2.dev',
    },
    runtime: {
      EnvHttpProxyAgent: class FakeProxyAgent {
        constructor(options?: unknown) {
          constructorOptions = options ?? null;
        }
      },
      setGlobalDispatcher() {},
      readFileSync() {
        throw new Error('should not be called');
      },
    },
    logger: {
      info() {},
    },
  });

  assert.deepEqual(constructorOptions, {
    noProxy: 'aws.s2.dev,salambo-demo.b.aws.s2.dev,localhost,127.0.0.1,::1,otel-collector.app.daytona.io',
    proxyTls: undefined,
    requestTls: undefined,
  });
});


test('installGlobalProxySupport is idempotent', () => {
  let calls = 0;

  const runtime = {
    EnvHttpProxyAgent: class {},
    setGlobalDispatcher() {
      calls += 1;
    },
    readFileSync() {
      throw new Error('should not be called');
    },
  };

  installGlobalProxySupport({
    env: {
      HTTP_PROXY: 'http://proxy.internal:8080',
    },
    runtime,
    logger: {
      info() {},
    },
  });

  const second = installGlobalProxySupport({
    env: {
      HTTP_PROXY: 'http://proxy.internal:8080',
    },
    runtime,
    logger: {
      info() {},
    },
  });

  assert.equal(second, false);
  assert.equal(calls, 1);
});
