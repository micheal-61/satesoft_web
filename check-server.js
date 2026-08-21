fetch('http://localhost:3001/')
  .then(r => r.text())
  .then(html => {
    console.log('Has FA CDN:', html.includes('font-awesome'));
    const jsMatch = html.match(/assets\/index-[^"']+\.js/);
    const cssMatch = html.match(/assets\/index-[^"']+\.css/);
    console.log('JS bundle:', jsMatch ? jsMatch[0] : 'not found');
    console.log('CSS bundle:', cssMatch ? cssMatch[0] : 'not found');
  })
  .catch(e => console.error(e));
