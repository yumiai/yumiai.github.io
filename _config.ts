import lume from "lume/mod.ts";
import lightningCss from "lume/plugins/lightningcss.ts";
import sass from "lume/plugins/sass.ts";
import date from "lume/plugins/date.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";
import basePath from "lume/plugins/base_path.ts";
import slugifyUrls from "lume/plugins/slugify_urls.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import jsx from "lume/plugins/jsx_preact.ts";
import pageFind from "lume/plugins/pagefind.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed from "lume/plugins/feed.ts";
import picture from "lume/plugins/picture.ts";
import imagick from "lume/plugins/imagick.ts";

const site = lume({location: new URL("https://yumi.ai/")});

site
  .ignore(
    "README.md", "LICENSE", "CHANGELOG.md",
    "flake.nix", "flake.lock", "default.nix", "shell.nix",  
    "assets/css/webpack.config.js.sample", "assets/css/header.svg", "assets/css/README.md", 
    "Caddyfile", "llama2context.md", "ts-exp1.tsx", "ts-exp2.tsx" )
  .use(sass({
    format: "expanded",
  }))
  .use(lightningCss())  
  .use(jsx())
  .use(date())
  .use(codeHighlight())
  .use(basePath())
  .use(sitemap())
  .use(pageFind({
    ui: {
      resetStyles: false,
      containerId: "hero-search",
    },
  }))
  .use(slugifyUrls({ alphanumeric: false }))
  .use(feed({
    output: ["/feed.json", "/feed.xml"],
    query: "type=posts",
    info: {
      title: "=site.title",
      description: "=site.description",
    },
    items: {
      title: "=title",
      content: "$.post-body",
    }
  }))
  .use(resolveUrls())
  .use(picture())
  .use(imagick())
  .copy("assets/scripts")    
  .copyRemainingFiles();

export default site;
