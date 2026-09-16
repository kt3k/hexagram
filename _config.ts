import lume from "lume/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import sitemap from "lume/plugins/sitemap.ts";
import basePath from "lume/plugins/base_path.ts";

const site = lume({
  src: "./src",
  dest: "./_site",
  location: new URL("https://kt3k.github.io/hexagram/"),
});

site.use(tailwindcss());
// GitHub Pages のプロジェクトページは /hexagram/ 以下に置かれるため、
// 絶対パスの参照に location のパスを補う
site.use(basePath());
site.use(sitemap());

site.add("styles.css");
site.add("favicon.svg");
site.add("img");
site.add("js");

export default site;
