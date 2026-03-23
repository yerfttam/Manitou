/**
 * listings-loader.js — Manitou Lodge
 *
 * Fetches data/listings.json and dynamically renders the accommodations page:
 * sticky category nav, section headers, property cards with photo carousels.
 */

// Section descriptions keyed by category slug.
// These come from the owner, not Guesty — edit here to update copy.
const SECTION_COPY = {
  'lodge-rooms': {
    label: 'Main Lodge',
    desc: 'Comfortable rooms inside the main lodge building, anchored by the great room\'s massive stone fireplace and vaulted ceilings. Each room has its own character with easy access to the lodge\'s shared spaces and grounds.',
  },
  'cottage-rooms': {
    label: 'Private Cottage',
    desc: 'Two charming rooms in a separate cottage building, offering a quieter and more private stay while remaining steps from the main lodge and the forest trails beyond.',
  },
  'cabins': {
    label: 'Rustic Cabins',
    desc: 'Standalone cabins tucked into the old-growth coastal rainforest. Private, quiet, and surrounded by hemlock and spruce that have stood for centuries.',
  },
  'a-frames': {
    label: 'Unique Stays',
    desc: 'Classic A-frame structures set within the forested grounds. Simple, cozy, and close to nature — a different kind of stay on the Olympic Peninsula.',
  },
  'camping-and-tent-sites': {
    label: 'Camping',
    desc: 'Designated tent sites spread across the Manitou grounds. Fall asleep to the sound of the Sol Duc River and wake up in one of the most remote corners of the lower 48.',
  },
};

// Grid column class per category
const GRID_CLASS = {
  'lodge-rooms':            '',              // 3-col default
  'cottage-rooms':          'prop-grid--2',
  'cabins':                 'prop-grid--2',
  'a-frames':               'prop-grid--2',
  'camping-and-tent-sites': '',              // 3-col for 15 sites
};

// Card size modifier per category
const CARD_CLASS = {
  'camping-and-tent-sites': 'prop-card--site',
};

function renderPrice(price) {
  if (!price || !price.base) return '';
  return `From $${price.base}/night`;
}

function renderCard(listing, slug) {
  const photos   = (listing.photos && listing.photos.length) ? listing.photos : [];
  const firstSrc = photos.length ? photos[0].original : '';
  const cardMod  = CARD_CLASS[slug] || '';
  const price    = renderPrice(listing.price);
  const guests   = listing.accommodates ? `${listing.accommodates} guests` : '';
  const beds     = listing.bedrooms     ? `${listing.bedrooms} bd`         : '';
  const baths    = listing.bathrooms    ? `${listing.bathrooms} ba`        : '';
  const meta     = [guests, beds, baths].filter(Boolean).join(' &middot; ');

  const photoData = JSON.stringify(photos.map(p => p.original));

  const dots = photos.map((_, i) =>
    `<span class="prop-dot${i === 0 ? ' active' : ''}"></span>`
  ).join('');

  const arrows = photos.length > 1 ? `
    <button class="carousel-btn carousel-btn--prev" aria-label="Previous photo">&#8249;</button>
    <button class="carousel-btn carousel-btn--next" aria-label="Next photo">&#8250;</button>` : '';

  return `
    <div class="prop-card ${cardMod}">
      <div class="prop-card-carousel" data-photos='${photoData}' data-index="0">
        ${firstSrc ? `<img class="prop-card-img" src="${firstSrc}" alt="${listing.name}" loading="lazy" />` : ''}
        ${arrows}
      </div>
      <div class="prop-card-body">
        ${photos.length > 1 ? `<div class="prop-card-dots">${dots}</div>` : ''}
        <div class="prop-card-name">${listing.name}</div>
        ${listing.summary ? `<div class="prop-card-desc">${listing.summary}</div>` : ''}
        ${price ? `<div class="prop-card-price">${price}</div>` : ''}
        ${meta  ? `<div class="prop-card-meta">${meta}</div>`   : ''}
        <a href="${listing.bookingUrl}" target="_blank" rel="noopener" class="prop-card-book">
          Book Now &rarr;
        </a>
      </div>
    </div>`;
}

function renderSection(category) {
  const slug  = category.slug;
  const copy  = SECTION_COPY[slug] || { label: 'Accommodations', desc: '' };
  const grid  = GRID_CLASS[slug]   || '';
  const cards = category.listings.map(l => renderCard(l, slug)).join('');

  return `
    <section class="accom-section" id="${slug}">
      <div class="section-header">
        <p class="section-header-label">${copy.label}</p>
        <h2 class="section-header-title">${category.name}</h2>
        ${copy.desc ? `<p class="section-header-desc">${copy.desc}</p>` : ''}
      </div>
      <div class="prop-grid-wrap">
        <div class="prop-grid ${grid}">
          ${cards}
        </div>
      </div>
    </section>`;
}

function renderCatNav(categories) {
  return categories.map(cat =>
    `<a href="#${cat.slug}">${cat.name}</a>`
  ).join('');
}

async function loadListings() {
  const navEl      = document.getElementById('listings-cat-nav');
  const sectionsEl = document.getElementById('listings-sections');
  if (!navEl || !sectionsEl) return;

  try {
    const res  = await fetch('data/listings.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    navEl.innerHTML      = renderCatNav(data.categories);
    sectionsEl.innerHTML = data.categories.map(renderSection).join('');

    // If the URL has a hash (e.g. arriving from another page via dropdown),
    // scroll to that section now that the DOM is populated.
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        // Small delay lets the browser finish layout before we scroll
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    }

  } catch (err) {
    console.error('listings-loader: failed to load listings.json', err);
    sectionsEl.innerHTML = `
      <div style="padding:4rem 2rem; text-align:center; color:var(--text-mid);">
        <p>Unable to load property listings. Please try again later.</p>
      </div>`;
  }
}

function initCarousels() {
  const container = document.getElementById('listings-sections');
  if (!container) return;

  container.addEventListener('click', e => {
    const btn = e.target.closest('.carousel-btn');
    if (!btn) return;

    e.preventDefault();
    const carousel = btn.closest('.prop-card-carousel');
    const card     = carousel.closest('.prop-card');
    const photos   = JSON.parse(carousel.dataset.photos);
    let   index    = parseInt(carousel.dataset.index, 10);

    index = btn.classList.contains('carousel-btn--prev')
      ? (index - 1 + photos.length) % photos.length
      : (index + 1) % photos.length;

    carousel.querySelector('.prop-card-img').src = photos[index];
    carousel.dataset.index = index;

    card.querySelectorAll('.prop-dot').forEach((d, i) =>
      d.classList.toggle('active', i === index)
    );
  });
}

document.addEventListener('DOMContentLoaded', loadListings);
document.addEventListener('DOMContentLoaded', initCarousels);
