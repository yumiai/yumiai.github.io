import lume from "lume/mod.ts";
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

const site = lume({location: new URL("https://yumi.ai.com/")});

// site.filter("random-delay", function(value) {return '${value}${Math(floor(Math.random()*5)}s';});

site
  .ignore("README.md", "flake.nix", "flake.lock", "default.nix", "shell.nix")
  .copy("assets")
  .copy("scripts")
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
  .use(imagick())
  .use(picture())
  .use(sass());

export default site;
