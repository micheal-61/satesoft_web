fetch('http://localhost:5173/')
  .then(r => r.text())
  .then(html => {
    console.log('Has FA CDN:', html.includes('font-awesome'));
    console.log('Has script src:', html.includes('src="/src/index.jsx"'));
    console.log('First 200 chars:', html.substring(0, 200));
  })
  .catch(e => console.error(e));
