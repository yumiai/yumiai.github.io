import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";
import basePath from "lume/plugins/base_path.ts";
import slugifyUrls from "lume/plugins/slugify_urls.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import jsx from "lume/plugins/jsx_preact.ts";
import pageFind from "lume/plugins/pagefind.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed from "lume/plugins/feed.ts";


const site = lume({location: new URL("https://yumi.ai.com/")});

// site.filter("random-delay", function(value) {return '${value}${Math(floor(Math.random()*5)}s';});

site
  .ignore("README.md", "flake.nix", "flake.lock", "default.nix", "shell.nix")
  .copy("assets")
  .copy("scripts")
  .use(jsx())
  .use(tailwindcss({
    // Extract the classes from HTML and njk files
    extensions: [".html", ".njk", ".tsx", ".js", ".css"],

    // Tailwind options, like the theme colors and fonts
    options: {

      plugins: [
        function ({ addUtilities }) {
          addUtilities({
            '.mask-radial': {
              maskImage: 'radial-gradient(67% 50% at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 80%)',
              WebkitMaskImage: 'radial-gradient(67% 50% at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 80%)'
            }
          }, ['responsive', 'hover']);
        },
      ],

      theme: {
        extend: {
          colors: {
            'coconut-cream': {
              'DEFAULT': '#fcfaed',
              '50': '#fcfaed',
              '100': '#f6f1cf',
              '200': '#ede29a',
              '300': '#e3ce66',
              '400': '#dcbb43',
              '500': '#d4a02c',
              '600': '#bb7f24',
              '700': '#9c5e21',
              '800': '#7f4b21',
              '900': '#693e1e',
              '950': '#3c200c',
            },          
            'english-holly': {
              '50': '#effef2',
              '100': '#d9ffe0',
              '200': '#b5fdc3',
              '300': '#7cf997',
              '400': '#3cec62',
              '500': '#12d53d',
              '600': '#09b02d',
              '700': '#0b8a27',
              '800': '#0e6d24',
              '900': '#0e5921',
              'DEFAULT': '#012e0d',
              '950': '#012e0d',
            },             
            'tuscany': {
              '50': '#fcf7f0',
              '100': '#f9ecdb',
              '200': '#f1d7b7',
              '300': '#e8bc89',
              '400': '#de9759',
              '500': '#d67c39',
              'DEFAULT': '#cb672f',
              '600': '#cb672f',
              '700': '#a64f28',
              '800': '#854027',
              '900': '#6c3622',
              '950': '#3a1a10',
            },     
            
            // TODO: These colors are related to the mask-radical class above.
            'black-alpha': 'rgba(0,0,0,1)',
            'transparent': 'rgba(0,0,0,0)',
          },
          maxHeight: {
            'viewport-200': 'calc(100vh - 200px)' // the class .max-h-viewport-200
          },
          fontFamily: {      
            'serif': ["Fraunces, Merriweather, serif", {fontVariationSettings: '"wght" 400, "SOFT" 100, "WONK" 1'} ],  
            'header': ["Fraunces, Merriweather, serif", {fontVariationSettings: '"wght" 400, "SOFT" 100, "WONK" 1'} ], 
            'fine-print': ["Fraunces, Merriweather, serif", {fontVariationSettings: '"wght" 200, "SOFT" 100, "WONK" 1'} ], 
            'sans': ['var(--font-family)', {fontVariationSettings: '"wght" 300, "slnt" 0'} ],
            'body': ['var(--font-family)', {fontVariationSettings: '"wght" 300, "slnt" 0'} ],                 
          },

          backgroundImage: {
            'pattern-1': "url('/assets/images/watercolour1.png')",
            'pattern-2': "url('/assets/images/watercolour3.png')",
            'noise': "url('/assets/images/noise.jpg')",
          },

          keyframes: {
            'kf-scroll-right' : {
              '0%, 100%': { transform: 'translateX(-50%)' },
              '50%': { transform: 'translateX(0%)' },
            },
            'kf-pulse': {
              '0%, 100%': { opacity: 0 },
              '50%': { opacity: 1 },
            },
            'kf-fade': {
              '0%, 100%': {opacity: 1},
              '50%': {opacity: 0},
            },  
          },

          animation: {
            'scroll-right': '240s ease-in-out infinite kf-scroll-right',
            'bg-1': '30s 0s infinite kf-fade',
            'bg-2': '30s 15s infinite kf-fade',
            'pulse': '10s infinite ease-in-out ',
          },

        },
      },
    },
  }))
  .use(postcss())
  .use(date())
  .use(codeHighlight())
  .use(basePath())
  .use(sitemap())
  .use(pageFind({
    ui: {
      resetStyles: false,
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
  .use(resolveUrls());

export default site;
