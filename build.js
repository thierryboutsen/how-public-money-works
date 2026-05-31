const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// Setup directories
const DIST_DIR = path.join(__dirname, 'dist');
const SRC_DIR = path.join(__dirname, 'src');
const CONTENT_DIR = path.join(__dirname, 'content', 'posts');

if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Copy static assets
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursiveSync(path.join(SRC_DIR, 'assets'), path.join(DIST_DIR, 'assets'));
copyRecursiveSync(path.join(SRC_DIR, 'shared'), path.join(DIST_DIR, 'shared'));
fs.copyFileSync(path.join(SRC_DIR, 'index.html'), path.join(DIST_DIR, 'index.html'));
fs.copyFileSync(path.join(SRC_DIR, '404.html'), path.join(DIST_DIR, '404.html'));

// Setup markdown parser for custom shortcodes
function parseMarkdownWithShortcodes(markdown) {
  // Replace shortcodes before parsing with marked
  let processed = markdown
    .replace(/\[dropcap\](.*?)\[\/dropcap\]/g, '<span class="dropcap">$1</span>')
    .replace(/\[pullquote\](.*?)\[author\](.*?)\[\/pullquote\]/gs, '<div class="pull-quote"><blockquote>$1</blockquote><div class="attr">— $2</div></div>')
    .replace(/\[pullquote\](.*?)\[\/pullquote\]/gs, '<div class="pull-quote"><blockquote>$1</blockquote></div>')
    .replace(/\[keyterm\](.*?)\[def\](.*?)\[\/keyterm\]/gs, '<div class="key-term"><div class="label">Key Term</div><div class="term">$1</div><p class="definition">$2</p></div>')
    .replace(/\[diagram\](.*?)\[\/diagram\]/gs, `<div class="diagram"><div class="label">A Reader's Diagram</div><h4>$1</h4><svg width="100%" height="160" viewBox="0 0 560 160" fill="none" style="background:#FDFDFD; border:1px solid #E8DFC9;"><rect x="40" y="30" width="200" height="100" stroke="#A88752" stroke-dasharray="4"/><text x="140" y="85" text-anchor="middle" font-family="Playfair Display" font-size="16" fill="#0C1A2C">Diagram Blueprint</text><line x1="240" y1="80" x2="320" y2="80" stroke="#A88752" stroke-width="1.5"/><rect x="320" y="30" width="200" height="100" stroke="#A88752" stroke-dasharray="4"/></svg></div>`)
    .replace(/^## (.*?)$/gm, '<h2><span class="num">§</span> $1</h2>');

  return marked.parse(processed);
}

// Read and parse all posts
const posts = [];
const files = fs.readdirSync(CONTENT_DIR);

files.forEach(file => {
  if (path.extname(file) === '.md') {
    const rawContent = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const { data, content } = matter(rawContent);
    
    if (data.status === 'published') {
      const htmlBody = parseMarkdownWithShortcodes(content);
      const wordCount = content.split(/\\s+/).length;

      posts.push({
        ...data,
        body: htmlBody,
        wordCount: wordCount,
        slug: data.slug || path.basename(file, '.md')
      });
    }
  }
});

// Sort posts by date descending
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

// Generate post pages
const postTemplate = fs.readFileSync(path.join(SRC_DIR, 'templates', 'post.html'), 'utf-8');

posts.forEach((post, index) => {
  let output = postTemplate;
  output = output.replace(/{{seoTitle}}/g, post.seoTitle || post.title);
  output = output.replace(/{{metaDescription}}/g, post.metaDescription || post.excerpt);
  output = output.replace(/{{slug}}/g, post.slug);
  output = output.replace(/{{featuredImage}}/g, post.featuredImage || '');
  output = output.replace(/{{author}}/g, post.author || 'Eliana Faria Lima');
  output = output.replace(/{{date}}/g, post.date);
  output = output.replace(/{{category}}/g, post.category);
  output = output.replace(/{{index}}/g, String(posts.length - index).padStart(2, '0'));
  output = output.replace(/{{title}}/g, post.title);
  output = output.replace(/{{subtitle}}/g, post.subtitle);
  output = output.replace(/{{readingTime}}/g, post.readingTime);
  output = output.replace(/{{wordcount}}/g, post.wordCount.toLocaleString());
  output = output.replace(/{{body}}/g, post.body);

  fs.writeFileSync(path.join(DIST_DIR, `${post.slug}.html`), output);
});

// Generate insights (Blog Index) page
const insightsTemplate = fs.readFileSync(path.join(SRC_DIR, 'templates', 'insights.html'), 'utf-8');
let cardsHtml = '';

posts.forEach((post, index) => {
  const num = String(posts.length - index).padStart(2, '0');
  cardsHtml += `
  <article class="essay-card" data-category="${(post.category || '').toLowerCase()}" onclick="window.location.href='${post.slug}.html'">
    <div class="photo-slot light photo-illus" style="background-image: url('${post.featuredImage || ''}'); background-size: cover; background-position: center;">
      <!-- Removed SVG placeholder if we have an image, but let's keep the slot style -->
    </div>
    <div class="body">
      <div class="meta-row">
        <span class="cat">${post.category}</span>
        <span class="num">N.º ${num}</span>
      </div>
      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>
      <div class="card-foot">
        <span class="time">${post.readingTime}</span>
        <span class="read">Read →</span>
      </div>
    </div>
  </article>\n  `;
});

const insightsOutput = insightsTemplate.replace('{{posts_grid}}', cardsHtml);
fs.writeFileSync(path.join(DIST_DIR, 'insights.html'), insightsOutput);

console.log(`Build complete. Generated ${posts.length} posts.`);
