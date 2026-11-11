import { readFileSync, writeFileSync } from 'node:fs';

const dir = new URL('.', import.meta.url);
const content = JSON.parse(readFileSync(new URL('content.json', dir), 'utf8'));
const profile = content.profile;
const escape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);
function href(url) {
  if (!['https:', 'http:', 'mailto:'].includes(new URL(url).protocol)) throw new Error('Invalid URL: ' + url);
  return escape(url);
}
function icon(paths, viewBox = '0 0 24 24') {
  return `<svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}
const arrow = icon('<path d="M6 18 18 6M6 6h12v12"/>');
const mail = icon('<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m4 6 8 6 8-6"/>');
const pin = icon('<path d="M19 9c0 5-7 12-7 12S5 14 5 9a7 7 0 1 1 14 0Z"/><circle cx="12" cy="9" r="2.2"/>');
const mark = '<svg class="mark" viewBox="0 0 36 36" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.25"><ellipse cx="18" cy="18" rx="17" ry="6.1" transform="rotate(-40 18 18)"/><ellipse cx="18" cy="18" rx="17" ry="6.1" transform="rotate(40 18 18)"/><circle cx="18" cy="18" r="2" fill="currentColor"/></g></svg>';
const timeFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
const news = [...content.news].sort((a, b) => b.date.localeCompare(a.date));
const count = content.recentNewsCount;
if (!Number.isInteger(count) || count < 1) throw new Error('recentNewsCount must be a positive integer');
function paperDetails(item) {
  const authors = item.authors.map(name => name === profile.name ? `<strong>${escape(name)}</strong>` : escape(name)).join(', ');
  return `<div class="paper-details"><h3><a href="${href(item.url)}">${escape(item.title)} ${arrow}</a></h3><p>${authors}</p><p class="venue">${escape(item.venue)}</p>${item.award ? `<span class="award">${escape(item.award)}</span>` : ''}</div>`;
}
function newsRow(item) {
  const date = new Date(item.date + 'T00:00:00Z');
  if (date.toISOString().slice(0, 10) !== item.date) throw new Error('Invalid date: ' + item.date);
  let details;
  if (item.type === 'Preprint') {
    const paper = content.publications.find(paper => paper.url === item.url);
    if (!paper) throw new Error(`Preprint news entry dated ${item.date} has no matching paper in publications for URL: ${item.url}`);
    details = paperDetails(paper);
  } else {
    const title = item.url ? `<a href="${href(item.url)}">${escape(item.title)} ${arrow}</a>` : escape(item.title);
    details = `<div><h3>${title}</h3><p>${escape(item.detail)}</p></div>`;
  }
  return `<li class="news-row"><div class="news-meta"><time datetime="${escape(item.date)}">${timeFormat.format(date)}</time><span class="type">${escape(item.type)}</span></div>${details}</li>`;
}
function publication(item) {
  return `<li class="pub-row"><div class="pub-meta"><span class="year">${escape(item.year)}</span><span class="type">${escape(item.type)}</span></div>${paperDetails(item)}</li>`;
}
function background(items) {
  return items.map(item => `<li><span class="period">${escape(item.period)}</span><h4>${escape(item.title)}</h4><p class="place">${escape(item.place)}</p>${item.thesis ? `<p>Thesis: ${escape(item.thesis)}</p>` : ''}${item.advisor ? `<p>Advisor: <a href="${href(item.advisor.url)}">${escape(item.advisor.label)}</a></p>` : ''}${item.detail ? `<p>${escape(item.detail)}</p>` : ''}</li>`).join('');
}
function sectionHeading(num, title) {
  return `<div class="section-heading"><span aria-hidden="true" class="section-number">/${num}</span><h2>${title}</h2></div>`;
}
const profiles = profile.links.map(link => `<a href="${href(link.url)}">${escape(link.label)} ${arrow}</a>`).join('');
const portrait = './alex-della-schiava.png';
const styles = readFileSync(new URL('styles.css', dir), 'utf8');
const favicon = 'data:image/svg+xml;base64,' + readFileSync(new URL('favicon.svg', dir)).toString('base64');
function siteHeader(isAbout = false) {
  const homePath = isAbout ? './index.html' : '';
  return `<header class="site-header"><div class="frame header-inner"><a class="signature" href="${isAbout ? './index.html' : '#top'}" aria-label="${isAbout ? 'Home' : 'Back to top'}">${mark}<span>${escape(profile.shortName)}</span></a>
<nav aria-label="Main navigation"><a href="${homePath}#news">News</a><a href="${homePath}#publications">Papers</a><a href="${homePath}#background">Background</a><a href="./about.html"${isAbout ? ' aria-current="page"' : ''}>About me</a></nav></div></header>`;
}
const footer = `<footer class="frame"><span>${escape(profile.name)}</span><a href="${href('mailto:' + profile.email)}">${escape(profile.email)} ${arrow}</a><a class="toplink" href="#top">Back to top ↑</a></footer>`;
function inlineText(parts) {
  return parts.map(part => {
    if (typeof part === 'string') return escape(part);
    if (part.emoji) return `<span class="emoji" aria-hidden="true">${escape(part.emoji)}</span>`;
    return `<a href="${href(part.url)}">${escape(part.text)}</a>`;
  }).join('');
}
const home = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#faf9f6">
<title>${escape(profile.name)} · ${escape(profile.field)}</title>
<meta name="description" content="${escape(profile.name)} is a ${escape(profile.role)} at ${escape(profile.affiliation)}. Research in ${escape(profile.keywords.join(', '))}.">
<link rel="icon" href="${favicon}" type="image/svg+xml"><style>${styles}</style>
</head><body id="top"><a class="skip" href="#main">Skip to content</a>
${siteHeader()}
<main id="main" class="frame">
<section class="hero" aria-labelledby="name"><div class="intro">
<p class="field"><span></span>${escape(profile.field)}</p>
<h1 id="name">${escape(profile.name)}</h1>
<p class="byline">${escape(profile.role)} <span>·</span> ${escape(profile.affiliation)}</p>
<div class="bio">
<p>${escape(profile.supervision)} <a href="${href(profile.supervisor.url)}">${escape(profile.supervisor.label)}</a>.</p>
<p>${escape(profile.internship)} <a href="${href(profile.employer.url)}">${escape(profile.employer.label)}</a>.</p>
</div>
<ul class="keywords" aria-label="Research interests" role="list">${profile.keywords.map(keyword => `<li>${escape(keyword)}</li>`).join('')}</ul>
<div class="links"><a class="email" href="${href('mailto:' + profile.email)}">${mail} Email</a>${profiles}</div></div>
<figure class="portrait"><div class="portrait-frame"><img src="${portrait}" width="244" height="270" alt="Portrait of ${escape(profile.name)}" fetchpriority="high"></div><figcaption>${pin} ${escape(profile.location)}</figcaption></figure></section>
<section class="section" id="news" aria-labelledby="news-title"><div id="news-title">${sectionHeading('01', 'Recent news')}</div>
<ol class="rows">${news.slice(0, count).map(newsRow).join('')}</ol>
${news.length > count ? `<details class="archive"><summary><span class="closed">Show older news</span><span class="opened">Hide older news</span><span class="count">(${news.length - count})</span><span class="chevron"></span></summary><ol class="rows">${news.slice(count).map(newsRow).join('')}</ol></details>` : ''}</section>
<section class="section" id="publications" aria-labelledby="pub-title"><div id="pub-title">${sectionHeading('02', 'Papers')}</div>
<ol class="rows">${[...content.publications].sort((a,b) => b.year - a.year).map(publication).join('')}</ol></section>
<section class="section" id="background" aria-labelledby="bg-title"><div id="bg-title">${sectionHeading('03', 'Background')}</div>
<div class="background"><div><h3>Education</h3><ul>${background(content.education)}</ul></div><div><h3>Experience</h3><ul>${background(content.experience)}</ul></div></div></section></main>
${footer}
</body></html>`;
const about = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#faf9f6">
<title>About me · ${escape(profile.name)}</title>
<meta name="description" content="Get to know ${escape(profile.name)}: roots in Friuli, para swimming, football, and learning languages.">
<link rel="icon" href="${favicon}" type="image/svg+xml"><style>${styles}</style>
</head><body id="top"><a class="skip" href="#main">Skip to content</a>
${siteHeader(true)}
<main id="main" class="frame about-page"><article class="about-copy" aria-labelledby="about-title">
<h1 id="about-title">About me</h1>
<p>${inlineText(content.about.intro)}</p>
<p>${inlineText(content.about.sports)}</p>
<p>${inlineText(content.about.languageIntro)}</p>
<ul class="about-languages" role="list">${content.about.languages.map(language => `<li><span class="emoji" aria-hidden="true">${escape(language.flag)}</span><span>${escape(language.name)}${language.aside ? ` ${escape(language.aside)}` : ''}</span></li>`).join('')}</ul>
<p>${inlineText(content.about.languageNote)}</p>
</article></main>
${footer}
</body></html>`;
writeFileSync(new URL('index.html', dir), home);
writeFileSync(new URL('about.html', dir), about);
