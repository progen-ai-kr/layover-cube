import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, createStore, STORAGE_KEY } from '../lumino/state.js';
import { journeySelections, journalMarkup, tasteResultMarkup } from '../lumino/journal.js';

test('미선택 항목과 미완료 취향을 예시 상품·사진으로 채우지 않는다', () => {
  const state = freshState();
  assert.deepEqual(journeySelections(state), { look:null, photo:null, taste:null });
  assert.equal((journalMarkup(state).match(/memory-empty-content/g) || []).length, 5);
  assert.equal(tasteResultMarkup(state), '');
  state.answers = { destination:'city', mood:'luxury', item:'pearls' };
  assert.equal(journeySelections(state).taste, null);
});

test('마지막으로 고른 의상·사진·취향을 재방문 후에도 기록과 결과에 동일하게 표시한다', () => {
  const data = new Map(), storage = { getItem:key=>data.get(key), setItem:(key,value)=>data.set(key,value) };
  const store = createStore(storage);
  store.update({ favoriteId:'pink-daydream', photoId:'castle-dream', answers:{ destination:'paris', mood:'romantic', item:'dress' }, tasteComplete:true });
  store.update({ favoriteId:'lavender-wish', photoId:'sweet-afternoon', answers:{ destination:'city', mood:'luxury', item:'pearls' } });
  const restored = createStore(storage).get(), selected = journeySelections(restored);
  assert.equal(selected.look.title, 'Lavender Wish');
  assert.equal(selected.photo.id, 'sweet-afternoon');
  assert.equal(selected.taste.destination.value, 'city');
  assert.equal(selected.taste.item.value, 'pearls');
  for (const html of [journalMarkup(restored), tasteResultMarkup(restored)]) {
    assert.ok(html.includes('Lavender Wish'));
    assert.ok(html.includes('images/lumino-dessert.jpg'));
    assert.ok(html.includes('images/lumino-city.jpg'));
    assert.ok(html.includes('진주 액세서리'));
    assert.ok(!html.includes('Pink Daydream'));
  }
  assert.ok(data.get(STORAGE_KEY));
});

test('운영 상품을 선택하면 해당 상품 이미지·상세 주소를 사용하고 사용자 텍스트를 이스케이프한다', () => {
  const store = createStore({ getItem:()=>null, setItem:()=>{} });
  const product = { id:'product:brand-01', productId:'brand-01', title:'<img onerror="bad"> & 니트', image:'images/products/chosen.jpg', category:'KNIT' };
  store.update({ productLooks:[product], favoriteId:product.id, answers:{ destination:'castle', mood:'cute', item:'ribbon' }, tasteComplete:true, traveler:'<script>oops</script>' });
  for (const html of [journalMarkup(store.get()), tasteResultMarkup(store.get())]) {
    assert.ok(html.includes('href="product.html?id=brand-01"'));
    assert.ok(html.includes('images/products/chosen.jpg'));
    assert.ok(html.includes('&lt;img onerror=&quot;bad&quot;&gt; &amp; 니트'));
    assert.ok(!html.includes('<script>'));
    assert.ok(!html.includes('<img onerror='));
  }
});
