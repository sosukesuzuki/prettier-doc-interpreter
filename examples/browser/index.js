import "regenerator-runtime/runtime"

const rootElement = document.querySelector(".root");
(async () => {
  rootElement.innerHTML = "<p>...Loading</p>";
  try {
    const { evaluate } = await import("../../dist/index.js");
    const source = `group(concat(["foo", hardline, "bar"]))`;
    const result = evaluate(source);
    rootElement.innerHTML = `<p>${result}</p>`;
  } catch (error) {
    rootElement.style = "color: red;";
    rootElement.innerHTML = `<p>${error.toString()}</p>`;
    console.error(error);
  }
})();
