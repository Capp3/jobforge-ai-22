// MathJax configuration for MkDocs
window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex"
  }
};

document.addEventListener("DOMContentLoaded", function() {
  var mathJax = document.createElement("script");
  mathJax.src = "https://polyfill.io/v3/polyfill.min.js?features=es6";
  document.head.appendChild(mathJax);
  
  var mathJax2 = document.createElement("script");
  mathJax2.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
  document.head.appendChild(mathJax2);
}); 