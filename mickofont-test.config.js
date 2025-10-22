/** @type {import('./src/types/ProjectConfig').ProjectConfig} */
export default {
  verbose: true,
  optimizationLevel: 'FULL',
  svgToFontOptions: {
    src: './icons/svg/',
    dist: './icons/fonts/',
    fontName: 'mickofont',
    css: true,
    classNamePrefix: "mk",
    emptyDist: false,
    generateInfoData: true,
    svg2ttf: true,
    svgicons2svgfont: {
      fontHeight: 1000, normalize: true,
    },
    website: {
      title: "mickofont",
      meta: {
        description: "EASY to use SVG Convertion to font in CLI.",
        keywords: "svgtofont,TTF,EOT,WOFF,WOFF2,SVG"
      },
      description: ``,
      corners: {
        url: 'https://github.com/jaywcjlove/svgtofont',
        width: 62, // default: 60
        height: 62, // default: 60
        bgColor: '#000000ff' // default: '#151513'
      },
      links: [
        {
          title: "GitHub",
          url: "https://github.com/jaywcjlove/svgtofont"
        },
        {
          title: "Feedback",
          url: "https://github.com/jaywcjlove/svgtofont/issues"
        },
        {
          title: "Font Class",
          url: "index.html"
        },
        {
          title: "Unicode",
          url: "unicode.html"
        }
      ],
      footerInfo: `Licensed under MIT. (Yes it's free and <a href="https://github.com/jaywcjlove/svgtofont">open-sourced</a>`
    },
    //svgoOptions: { multipass: true },

  }
}