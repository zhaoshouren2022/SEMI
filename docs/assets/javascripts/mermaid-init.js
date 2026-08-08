document.addEventListener("DOMContentLoaded", function () {
  mermaid.initialize({ startOnLoad: false, theme: "default" });
  document.querySelectorAll("pre.mermaid").forEach(function (pre, index) {
    var code = pre.querySelector("code");
    var div = document.createElement("div");
    div.className = "mermaid";
    mermaid.render("mermaid_" + index, code ? code.textContent : pre.textContent)
      .then(function (result) { div.innerHTML = result.svg; })
      .catch(function (err) { div.textContent = "Mermaid 渲染失败: " + err; });
    pre.replaceWith(div);
  });
});
