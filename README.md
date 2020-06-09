# prettier-doc-interpreter

**This is still experimental**

**This has not been published to npm yet**

## Usage

```js
const doc = `group(concat(["foo", hardline, "bar"]))`;
const formatted = evaluate(doc);
console.log(formatted); // foo\nbar
```

## Todo

- [x] Works on browsers
