import lume from "lume/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import sitemap from "lume/plugins/sitemap.ts";

const site = lume({
  src: "./src",
  dest: "./_site",
  location: new URL("https://kt3k.github.io/hexagram/"),
});

site.use(tailwindcss());
site.use(sitemap());

site.add("styles.css");
site.add("img");
site.add("js");

export default site;
