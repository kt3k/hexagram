// 一覧ページの絞りこみと表示切り替え
const input = document.querySelector("#q");
const items = [...document.querySelectorAll(".hex-card-item")];
const count = document.querySelector("#count");
const empty = document.querySelector("#empty");
const views = {
  sequence: document.querySelector("#view-sequence"),
  matrix: document.querySelector("#view-matrix"),
};
const buttons = [...document.querySelectorAll("[data-view]")];

let current = "sequence";

function filter() {
  const q = input.value.trim().toLowerCase();
  let shown = 0;
  for (const item of items) {
    const hit = q === "" || item.dataset.search.toLowerCase().includes(q);
    item.hidden = !hit;
    if (hit) shown++;
  }
  count.textContent = q === "" ? `全 ${items.length} 卦` : `${shown} 卦`;
  // 方陣は絞りこみの対象外なので、序卦の順のときだけ空の案内を出す
  empty.hidden = shown !== 0 || current !== "sequence";
}

function show(view) {
  current = view;
  for (const [name, element] of Object.entries(views)) {
    element.hidden = name !== view;
  }
  for (const button of buttons) {
    const active = button.dataset.view === view;
    button.setAttribute("aria-selected", String(active));
    button.dataset.variant = active ? "outline" : "ghost";
  }
  // 方陣に切り替えたときは絞りこみを解除して全体を見せる
  if (view === "matrix") empty.hidden = true;
  filter();
}

input.addEventListener("input", filter);
for (const button of buttons) {
  button.addEventListener("click", () => show(button.dataset.view));
}
filter();
