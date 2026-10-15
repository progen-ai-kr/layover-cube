import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, normalizeState, earnedIds, createStore, STORAGE_KEY } from '../lumino/state.js';
const memory = () => {const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
test('각 행동 조건을 완료해야 다섯 개의 스탬프가 지급되고 중복 지급되지 않는다',()=>{
  const store=createStore(memory());assert.deepEqual(earnedIds(store.get()),[]);
  assert.deepEqual(store.update({started:true}),['travel']);assert.deepEqual(store.update({started:true}),[]);
  assert.deepEqual(store.update({favoriteId:'not-a-real-outfit'}),[]);
  assert.deepEqual(store.update({favoriteId:'pink-daydream',favorites:['pink-daydream']}),['romance']);
  assert.deepEqual(store.update({photoId:'castle-dream'}),['fantasy']);
  assert.deepEqual(store.update({ribbonFound:true}),[]);
  assert.deepEqual(store.update({storyRead:true,ribbonFound:true}),['cute']);
  assert.deepEqual(store.update({answers:{destination:'paris',mood:'romantic'},tasteComplete:true}),[]);
  assert.deepEqual(store.update({answers:{destination:'paris',mood:'romantic',item:'ribbon'},tasteComplete:false}),[]);
  assert.deepEqual(store.update({tasteComplete:true}),['luxury']);assert.equal(earnedIds(store.get()).length,5);
  assert.deepEqual(store.update({favoriteId:'lavender-wish'}),[]);assert.equal(earnedIds(store.get()).length,5);
});
test('새 방문과 페이지 간 이동에서 선택, 이름, 지급일을 복원한다',()=>{
  const storage=memory(),store=createStore(storage);store.update({started:true,favoriteId:'pink-daydream',favorites:['pink-daydream'],traveler:'루미노 여행자'});
  const reloaded=createStore(storage);assert.deepEqual(reloaded.get(),store.get());assert.ok(reloaded.get().earnedAt.travel);assert.equal(reloaded.get().traveler,'루미노 여행자');
});
test('잘못되거나 오래된 저장 데이터로 스탬프를 얻을 수 없다',()=>{
  assert.deepEqual(normalizeState(null),freshState());assert.deepEqual(normalizeState({version:999,started:true}),freshState());
  const next=normalizeState({version:1,favoriteId:'deleted',photoId:'unknown',ribbonFound:true,answers:{destination:'invalid',mood:'bad',item:'bad'},tasteComplete:true,favorites:['bad'],earnedAt:{luxury:'today'}});
  assert.deepEqual(earnedIds(next),[]);assert.deepEqual(next.favorites,[]);
});
test('저장 차단과 손상된 JSON에서도 현 방문 내 여행은 동작한다',()=>{
  let warnings=0;const store=createStore({getItem:()=>'{broken',setItem:()=>{throw new Error('quota');}},()=>warnings++);
  assert.deepEqual(store.update({started:true}),['travel']);assert.equal(store.get().started,true);assert.equal(warnings,2);
});
test('같은 브라우저의 탭 동기화로 이미 받은 스탬프를 중복 지급하지 않는다',()=>{
  const store=createStore(memory());let awards=[];store.subscribe((state,ids)=>awards.push(...ids));store.sync({...freshState(),started:true});assert.deepEqual(awards,[]);assert.deepEqual(store.update({started:true}),[]);
});
test('저장 데이터에는 안전한 정규화 값과 마지막 카드 선택만 남는다',()=>{
  const storage=memory(),store=createStore(storage);store.update({favorites:['pink-daydream','pink-daydream','bad'],favoriteId:'pink-daydream',traveler:'a'.repeat(100)});
  store.update({favorites:[]});assert.equal(store.get().favoriteId,'pink-daydream');assert.equal(store.get().traveler.length,24);assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).version,1);
});
