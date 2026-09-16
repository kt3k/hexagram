// 配色の切り替え。選択は localStorage に残す
const KEY = "hexagram-theme";
const root = document.documentElement;

for (const button of document.querySelectorAll(".theme-toggle")) {
  button.addEventListener("click", () => {
    const dark = !root.classList.contains("dark");
    root.classList.toggle("dark", dark);
    try {
      localStorage.setItem(KEY, dark ? "dark" : "light");
    } catch (_) {
      // 保存できなくても切り替え自体は効かせる
    }
  });
}
