import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const nodes = new Map();
const get = id => {
  if (!nodes.has(id)) nodes.set(id, {value: '', textContent: '', children: [], replaceChildren() {this.children = []}, append(child) {this.children.push(child)}});
  return nodes.get(id);
};
const draw = {clearRect() {}, beginPath() {}, arc() {}, fill() {}, moveTo() {}, lineTo() {}, stroke() {}};
const pad = Object.assign(get('inkPad'), {width: 80, height: 40, getContext: () => draw,
  getBoundingClientRect: () => ({left: 0, top: 0, width: 40, height: 20}), setPointerCapture() {}});
const context = {document: {getElementById: get, createElement: () => ({})}, session: {checked: false},
  fetch: () => new Promise(() => {}), clearTimeout() {}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('public/handwriting.js', 'utf8'), context);
const run = code => vm.runInContext(code, context);
const pixels = new Uint8ClampedArray(pad.width * pad.height * 4);
function fill(left, top, width, height) {
  for (let y = top; y < top + height; y++) for (let x = left; x < left + width; x++) pixels[(y * pad.width + x) * 4 + 3] = 255;
}
context.pixels = pixels;
fill(10, 10, 3, 20);
fill(14, 10, 6, 20); // Just one empty column separates two written digits.
fill(10, 2, 1, 1); // A stray tap must not extend the answer crop.
assert.equal(run('splitInk(pixels,80,40)[0].top'), 2);
assert.equal(run('splitInk(cleanInkPixels(pixels,80,40),80,40).length'), 1);
assert.equal(run('splitInk(cleanInkPixels(pixels,80,40),80,40,1).length'), 2);
assert.equal(run('cleanInkPixels(pixels,80,40)[(2*80+10)*4+3]'), 0);
assert.equal(pixels[(2 * 80 + 10) * 4 + 3], 255, 'Recognition must not erase the visible drawing');
// Small handwriting was previously discarded for being less than 11 pixels high.
pixels.fill(0);fill(10, 10, 3, 7);
assert.equal(run('splitInk(cleanInkPixels(pixels,80,40),80,40).length'), 1);
pixels.fill(0);fill(10, 10, 3, 20);fill(14, 10, 6, 20);
// Exercise spacing alternatives independently of the trained classifier: even a
// very confident merged reading must not silently replace two nearby digits.
run(`digitModel={};rankInkDigits=box=>{const digit=box.right-box.left>6?8:box.left===10?1:2;return {consistent:true,choices:[{digit,confidence:.999},{digit:7,confidence:.001}]}}`);
assert.deepEqual(Array.from(run('inkAnswerReadings(pixels,80,40).map(l=>l.choices[0].answer)')).sort(), ['12', '8']);
draw.getImageData = () => ({data: pixels});
run('recognizeInk()');
assert.equal(get('answer').value, '', 'Spacing ambiguity requires confirmation');
assert(get('inkReview').children.some(b => b.textContent === 'Use 12'));
assert(get('inkReview').children.some(b => b.textContent === 'Use 8'));
get('inkReview').children.find(b => b.textContent === 'Use 12').onclick();
assert.equal(get('answer').value, '12');
assert.equal(get('inkReview').children.length, 0);
assert.equal(context.session.checked, false, 'Recognizing or selecting an answer never submits it');

run('initInk()');
const event = (type, pointerId, x, y, samples = []) => ({type, pointerId, clientX: x, clientY: y,
  preventDefault() {}, getCoalescedEvents: () => samples});
pad.onpointerdown(event('pointerdown', 1, 2, 3));
assert.equal(get('answer').value, '', 'New writing invalidates a previous reading');
pad.onpointermove(event('pointermove', 2, 20, 20)); // Ignore a second finger.
assert.equal(run('inkStrokes[0].length'), 1);
pad.onpointermove(event('pointermove', 1, 7, 8, [event('pointermove', 1, 5, 6)]));
assert.deepEqual(JSON.parse(run('JSON.stringify(inkStrokes[0])')), [{x: 4, y: 6}, {x: 10, y: 12}, {x: 14, y: 16}]);
run('recognizeInk()');assert.match(get('inkStatus').textContent, /Finish writing/);
run('undoInk();clearInk()');assert.equal(run('inkStrokes.length'), 1, 'Do not erase an active stroke');
pad.onpointerup(event('pointerup', 1, 9, 10));
assert.deepEqual(JSON.parse(run('JSON.stringify(inkStrokes[0].at(-1))')), {x: 18, y: 20});
pad.onpointerdown(event('pointerdown', 2, 12, 4));pad.onlostpointercapture(event('lostpointercapture', 2));
assert.equal(run('inkActive'), null, 'Lost capture must not leave the pad stuck');
get('answer').value = '12';run('undoInk()');
assert.equal(run('inkStrokes.length'), 1);assert.equal(get('answer').value, '');
context.session.checked = true;run('undoInk();clearInk()');assert.equal(run('inkStrokes.length'), 1, 'Submitted work stays locked');
context.session.checked = false;run('clearInk()');assert.equal(run('inkStrokes.length'), 0);
pad.onpointerdown(event('pointerdown', 3, 2, 3));context.session.checked = true;
pad.onpointerup(event('pointerup', 3, 9, 10));
assert.equal(run('inkStrokes[0].length'), 1, 'Finishing a pointer event cannot change submitted work');
context.session.checked = false;run('clearInk()');
assert.equal(get('inkReview').children.length, 0);
console.log('Passed: close digit spacing, stray-mark filtering, small digits, whole-answer confirmation, coalesced/final pointer samples, second-finger protection, undo, lost capture, and submitted-answer locking.');
