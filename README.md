# prettier-doc-interpreter

**This is still experimental**

## Usage

```js
import { evaluate } from "prettier-doc-interpreter";

const doc = `group(concat(["foo", hardline, "bar"]))`;
const formatted = evaluate(doc);
console.log(formatted); // foo\nbar
```

## Todo

- [x] Works on browsers
