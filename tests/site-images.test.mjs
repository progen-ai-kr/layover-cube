import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import worker from '../worker.js';
import { normalizeSiteImages } from '../data/site-images-schema.js';

test('독립 관리자에서 기본 SVG 로고와 아이콘을 공개 Worker 재요청 없이 표시한다', async () => {
  const originalFetch = globalThis.fetch;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>';
  let externalCalls = 0;
  globalThis.fetch = async () => { externalCalls++;return new Response('error code: 1042', {status:404}); };
  const env = { ADMIN_STANDALONE:'true', PUBLIC_SITE_URL:'https://public.test', ASSETS:{ fetch:async request => new Response(request.method === 'HEAD' ? null : svg, {headers:{'Content-Type':'image/svg+xml'}}) } };
  try {
    for (const path of ['/images/lumino-logo.svg','/images/favicon.svg']) {
      const response = await worker.fetch(new Request('https://admin.test'+path), env);
      assert.equal(response.status,200);
      assert.equal(response.headers.get('Content-Type'),'image/svg+xml');
      assert.equal(await response.text(),svg);
      const head = await worker.fetch(new Request('https://admin.test'+path,{method:'HEAD'}),env);
      assert.equal(head.status,200);assert.equal(await head.text(),'');
    }
    assert.equal(externalCalls,0);
  } finally { globalThis.fetch = originalFetch; }
});

test('사이트 이미지 설정에는 등록된 슬롯과 같은 사이트의 업로드 경로만 저장한다', () => {
  assert.deepEqual(normalizeSiteImages({ version:1, images:{} }), { version:1, images:{} });
  for (const path of ['javascript:alert(1)', 'https://outside.test/a.png', 'images/site/../admin-config.json', 'images/site/a.svg', 'images/site/a.png" onerror="alert(1)']) {
    assert.throws(() => normalizeSiteImages({ version:1, images:{ 'lumino-world-hero':path } }));
  }
  assert.throws(() => normalizeSiteImages({ version:1, images:{ unknown:'images/site/a.png' } }));
  assert.throws(() => normalizeSiteImages({ version:2, images:{} }));
});

test('관리자 인증·출처·충돌 검사와 팀별 저장, 즉시 공개 읽기를 함께 검증한다', async () => {
  const originalFetch = globalThis.fetch;
  const records = new Map();
  const writes = [];
  const config = { algorithm:'PBKDF2-SHA256', iterations:100000, salt:'dGVzdA==', hash:'test-only', sessionVersion:'media-test' };
  records.set('cube/admin-config.json', { sha:'config-sha', text:JSON.stringify(config) });
  records.set('cube/site-images.json', { sha:'original-sha', text:JSON.stringify({ version:1, images:{} }) });
  const env = { GITHUB_TOKEN:'test-only', GITHUB_OWNER:'test', GITHUB_REPOS:'cube,weave', SESSION_SECRET:'local-test-secret', ASSETS:{ fetch:async()=>new Response('static fallback') } };
  const payload = Buffer.from(JSON.stringify({ exp:Math.floor(Date.now()/1000)+3600, ver:config.sessionVersion })).toString('base64url');
  const signature = createHmac('sha256', env.SESSION_SECRET).update(payload).digest('base64url');
  const cookie = `brand_admin_session=${payload}.${signature}`;
  const origin = 'https://lumino.test';
  const request = (route, method='GET', data, authenticated=true, requestOrigin=origin, extra={}) => new Request(origin+route, {
    method,
    headers:{ ...(authenticated?{ Cookie:cookie }:{}), Origin:requestOrigin, 'Content-Type':'application/json', ...extra },
    ...(data !== undefined ? { body:typeof data==='string'?data:JSON.stringify(data) } : {})
  });
  globalThis.fetch = async (source, options={}) => {
    const match = new URL(source).pathname.match(/\/repos\/test\/([^/]+)\/contents\/(.+)/);
    assert(match, '서버는 지정된 GitHub 저장소만 사용해야 합니다.');
    const key = `${match[1]}/${decodeURIComponent(match[2])}`;
    const current = records.get(key);
    if (options.method === 'PUT') {
      const body = JSON.parse(options.body);
      if (current && current.sha !== body.sha) return Response.json({}, { status:409 });
      const updated = { sha:`saved-${writes.length}`, text:Buffer.from(body.content,'base64').toString() };
      records.set(key, updated);writes.push(key);
      return Response.json({ content:{ sha:updated.sha }, commit:{ html_url:'https://example.test/commit' } });
    }
    if (!current) return Response.json({}, { status:404 });
    if (new Headers(options.headers).get('Accept')?.includes('raw')) return new Response(current.text);
    return Response.json({ sha:current.sha, content:Buffer.from(current.text).toString('base64') });
  };
  try {
    const route = '/api/admin/site-images';
    assert.equal((await worker.fetch(request(route, 'GET', undefined, false),env)).status,401);
    assert.equal((await worker.fetch(request(route, 'PUT', {}, true, 'https://other.test'),env)).status,403);
    const first = await worker.fetch(request(route),env).then(r=>r.json());
    assert.equal(first.sha,'original-sha');
    const update = { settings:{ version:1, images:{ 'lumino-world-hero':'images/site/new-hero.png' } }, expectedSha:first.sha };
    assert.equal((await worker.fetch(request(route,'PUT',{...update,expectedSha:'old'}),env)).status,409);
    assert.equal(writes.length,0);
    assert.equal((await worker.fetch(request(route,'PUT',{...update,settings:{version:1,images:{evil:'https://bad.test'}}}),env)).status,400);
    const response = await worker.fetch(request(route,'PUT',update),env);
    assert.equal(response.status,200);assert.deepEqual(writes,['cube/site-images.json']);
    // 다른 관리자의 먼저 저장한 변경을 오래된 SHA로 덮어쓰지 않습니다.
    assert.equal((await worker.fetch(request(route,'PUT',update),env)).status,409);
    const publicResponse = await worker.fetch(new Request(origin+'/site-images.json'),env);
    assert.match(publicResponse.headers.get('Cache-Control'),/no-store/);
    assert.deepEqual((await publicResponse.json()).images,update.settings.images);
    const uploaded = await worker.fetch(request('/api/admin/image','POST','test-image-bytes',true,origin,{'Content-Type':'image/png','X-Upload-Scope':'site'}),env).then(r=>r.json());
    assert.match(uploaded.path,/^images\/site\/.*\.png$/);
    assert.equal(writes.filter(key=>key.startsWith('weave/')).length,0);
    const image = await worker.fetch(new Request(origin+'/'+uploaded.path),env);
    assert.equal(image.status,200);assert.equal(image.headers.get('Content-Type'),'image/png');
    assert.equal(await image.text(),'test-image-bytes');
    // 기존 제품 업로드의 두 팀 동기화는 그대로 유지합니다.
    await worker.fetch(request('/api/admin/image','POST','product-image',true,origin,{'Content-Type':'image/png','X-Upload-Scope':'product','X-Product-Id':'dress'}),env);
    assert(writes.some(key=>key.startsWith('weave/images/products/dress/')));
    const latest = await worker.fetch(request(route),env).then(r=>r.json());
    assert.equal((await worker.fetch(request(route,'PUT',{settings:{version:1,images:{}},expectedSha:latest.sha}),env)).status,200);
    assert.deepEqual((await worker.fetch(request(route),env).then(r=>r.json())).settings.images,{});
    const standalone = {...env, ADMIN_STANDALONE:'true'};
    for (const path of ['/admin-images.js','/admin-images.css','/data/site-image-slots.js','/data/site-images-schema.js']) {
      assert.equal((await worker.fetch(new Request(origin+path),standalone)).status,200);
    }
    assert.equal((await worker.fetch(new Request(origin+'/admin-config.json'),standalone)).status,404);
  } finally { globalThis.fetch=originalFetch; }
});
