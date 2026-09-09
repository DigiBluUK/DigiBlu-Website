const test = require("node:test");
const assert = require("node:assert/strict");
const { toJsx } = require("./html-to-jsx.cjs");

test("class, for and tabindex", () => {
  assert.equal(toJsx('<label class="a b" for="x" tabindex="-1">Hi</label>'), '<label className="a b" htmlFor="x" tabIndex={-1}>Hi</label>');
});

test("numeric attributes are emitted as numbers, inputmode is camelCased", () => {
  assert.equal(toJsx('<textarea rows="4" inputmode="text"></textarea>'), '<textarea rows={4} inputMode="text"></textarea>');
});

test("svg dashed attributes become camelCase, aria and data do not", () => {
  assert.equal(
    toJsx('<path stroke-width="1.6" stroke-linecap="round" fill-rule="evenodd" aria-hidden="true" data-service="ai"/>'),
    '<path strokeWidth="1.6" strokeLinecap="round" fillRule="evenodd" aria-hidden="true" data-service="ai"/>'
  );
});

test("the camelCase table", () => {
  assert.equal(toJsx('<input autocomplete="off" maxlength="3" readonly>'), '<input autoComplete="off" maxLength={3} readOnly />');
  assert.equal(toJsx('<link crossorigin fetchpriority="high">'), '<link crossOrigin fetchPriority="high" />');
});

test("style strings become objects", () => {
  assert.equal(toJsx('<div style="--tile-w: 10px; margin-top:4px;color:red"></div>'), "<div style={{'--tile-w': '10px', marginTop: '4px', color: 'red'}}></div>");
});

test("void elements self-close", () => {
  assert.equal(toJsx('<p>a<br>b<img src="/x.png" alt=""></p>'), '<p>a<br />b<img src="/x.png" alt="" /></p>');
});

test("comments and braces", () => {
  assert.equal(toJsx("<!-- note -->"), "{/* note */}");
  assert.equal(toJsx("<p>{x}</p>"), "<p>{'{'}x{'}'}</p>");
});

test("xlink:href", () => {
  assert.equal(toJsx('<use xlink:href="#a"/>'), '<use xlinkHref="#a"/>');
});
