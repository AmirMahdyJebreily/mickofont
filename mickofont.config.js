export default {
  verbose: true,
  optimizationLevel: 'full',
  svgToFontOptions: {
    src: '/home/codeagha/Projects/mickofont/result/svg',
    dist: '/home/codeagha/Projects/mickofont/result/fonts',
    fontName: 'mickofont',
    css: true,
    emptyDist: false,
    generateInfoData: true,
    svgicons2svgfont: { fontHeight: 1000, normalize: true },
    svgoOptions: { multipass: true }
  }
}