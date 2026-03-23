/**
 * listings-loader.js — Manitou Lodge
 *
 * Fetches data/listings.json and dynamically renders the accommodations page:
 * sticky category nav, section headers, property cards with photo carousels,
 * and a detail modal on card click.
 */

// Registry of all listings by id — used by modal
const listingRegistry = new Map();

// ── Description helpers ──────────────────────────────────────────────────────

// Short card description (4 lines max)
function getListingDesc(listing) {
  if (!listing.description) return listing.summary || '';
  const GENERIC = 'The Manitou Campground is located';
  const paras = listing.description.split('\n\n').map(p => p.trim()).filter(Boolean);
  const para = paras.find(p => !p.startsWith(GENERIC)) || paras[0] || '';
  const clean = para.replace(/^\*+\s*/g, '').replace(/\*+\s*/g, '').trim();
  return clean.length > 440 ? clean.slice(0, 440).replace(/\s+\S*$/, '') + '…' : clean;
}

// Full modal description — first 2 unique paragraphs
function getFullDesc(listing) {
  if (!listing.description) return listing.summary || '';
  const GENERIC = 'The Manitou Campground is located';
  const paras = listing.description.split('\n\n').map(p => p.trim()).filter(Boolean);
  const good  = paras.filter(p => !p.startsWith(GENERIC) && !p.startsWith('-') && p.length > 40);
  return good.slice(0, 2).map(p => p.replace(/^\*+\s*/g, '').replace(/\*+\s*/g, '').trim());
}

// ── Section / card copy ──────────────────────────────────────────────────────

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

const GRID_CLASS = {
  'lodge-rooms':            '',
  'cottage-rooms':          'prop-grid--2',
  'cabins':                 'prop-grid--2',
  'a-frames':               'prop-grid--2',
  'camping-and-tent-sites': '',
};

const CARD_CLASS = {
  'camping-and-tent-sites': 'prop-card--site',
};

function renderPrice(price) {
  if (!price || !price.base) return '';
  return `From $${price.base}/night`;
}

// ── Card renderer ────────────────────────────────────────────────────────────

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
    <div class="prop-card ${cardMod}" data-listing-id="${listing.id}">
      <div class="prop-card-carousel" data-photos='${photoData}' data-index="0">
        ${firstSrc ? `<img class="prop-card-img" src="${firstSrc}" alt="${listing.name}" loading="lazy" />` : ''}
        ${arrows}
      </div>
      <div class="prop-card-body">
        ${photos.length > 1 ? `<div class="prop-card-dots">${dots}</div>` : ''}
        <div class="prop-card-name">${listing.name}</div>
        <div class="prop-card-desc">${getListingDesc(listing)}</div>
        ${price ? `<div class="prop-card-price">${price}</div>` : ''}
        ${meta  ? `<div class="prop-card-meta">${meta}</div>`   : ''}
        <a href="${listing.bookingUrl}" target="_blank" rel="noopener" class="prop-card-book">
          Book Now &rarr;
        </a>
      </div>
    </div>`;
}

// ── Section renderer ─────────────────────────────────────────────────────────

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

// ── Modal ────────────────────────────────────────────────────────────────────

let modalPhotoIndex = 0;
let modalPhotos     = [];

function buildModal() {
  const el = document.createElement('div');
  el.id = 'prop-modal';
  el.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-panel">
      <button class="modal-close" aria-label="Close">&times;</button>
      <div class="modal-carousel">
        <img class="modal-img" src="" alt="" />
        <button class="modal-carousel-btn modal-carousel-prev">&#8249;</button>
        <button class="modal-carousel-btn modal-carousel-next">&#8250;</button>
        <div class="modal-dots"></div>
      </div>
      <div class="modal-body">
        <div class="modal-header">
          <div>
            <h2 class="modal-name"></h2>
            <p class="modal-meta"></p>
          </div>
          <div class="modal-price-wrap">
            <p class="modal-price"></p>
            <a class="modal-book btn-amber" href="#" target="_blank" rel="noopener">Book Now</a>
          </div>
        </div>
        <div class="modal-desc"></div>
        <div class="modal-amenities-wrap">
          <h3 class="modal-amenities-title">Amenities</h3>
          <ul class="modal-amenities"></ul>
        </div>
      </div>
    </div>`;
  document.body.appendChild(el);
  return el;
}

function openModal(listing) {
  const modal  = document.getElementById('prop-modal');
  modalPhotos      = (listing.photos || []).map(p => p.original);
  modalPhotoIndex  = 0;

  const price  = renderPrice(listing.price);
  const guests = listing.accommodates ? `${listing.accommodates} guests` : '';
  const beds   = listing.bedrooms     ? `${listing.bedrooms} bed`        : '';
  const baths  = listing.bathrooms    ? `${listing.bathrooms} bath`      : '';
  const meta   = [guests, beds, baths].filter(Boolean).join(' · ');
  const descParas = getFullDesc(listing);
  const amenities = (listing.amenities || []);

  modal.querySelector('.modal-img').src         = modalPhotos[0] || '';
  modal.querySelector('.modal-img').alt         = listing.name;
  modal.querySelector('.modal-name').textContent = listing.name;
  modal.querySelector('.modal-price').textContent = price;
  modal.querySelector('.modal-meta').textContent  = meta;
  modal.querySelector('.modal-desc').innerHTML    = descParas.map(p => `<p>${p}</p>`).join('');
  modal.querySelector('.modal-book').href         = listing.bookingUrl;
  modal.querySelector('.modal-amenities').innerHTML = amenities.map(a => `<li>${a}</li>`).join('');
  modal.querySelector('.modal-amenities-wrap').style.display = amenities.length ? '' : 'none';

  // Dots
  const dotsEl = modal.querySelector('.modal-dots');
  dotsEl.innerHTML = modalPhotos.map((_, i) =>
    `<span class="modal-dot${i === 0 ? ' active' : ''}"></span>`
  ).join('');

  // Arrow visibility
  const showArrows = modalPhotos.length > 1;
  modal.querySelector('.modal-carousel-prev').style.display = showArrows ? '' : 'none';
  modal.querySelector('.modal-carousel-next').style.display = showArrows ? '' : 'none';

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('prop-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function stepModalPhoto(dir) {
  const modal = document.getElementById('prop-modal');
  modalPhotoIndex = (modalPhotoIndex + dir + modalPhotos.length) % modalPhotos.length;
  modal.querySelector('.modal-img').src = modalPhotos[modalPhotoIndex];
  modal.querySelectorAll('.modal-dot').forEach((d, i) =>
    d.classList.toggle('active', i === modalPhotoIndex)
  );
}

function initModal() {
  const modal = buildModal();

  // Close on overlay click or X
  modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
  modal.querySelector('.modal-close').addEventListener('click', closeModal);

  // Keyboard close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft')  stepModalPhoto(-1);
    if (e.key === 'ArrowRight') stepModalPhoto(1);
  });

  // Modal carousel arrows
  modal.querySelector('.modal-carousel-prev').addEventListener('click', () => stepModalPhoto(-1));
  modal.querySelector('.modal-carousel-next').addEventListener('click', () => stepModalPhoto(1));

  // Card click → open modal (ignore carousel buttons and book link)
  document.getElementById('listings-sections').addEventListener('click', e => {
    if (e.target.closest('.carousel-btn'))   return;
    if (e.target.closest('.prop-card-book')) return;
    const card = e.target.closest('.prop-card');
    if (!card) return;
    const listing = listingRegistry.get(card.dataset.listingId);
    if (listing) openModal(listing);
  });
}

// ── Load + init ──────────────────────────────────────────────────────────────

async function loadListings() {
  const navEl      = document.getElementById('listings-cat-nav');
  const sectionsEl = document.getElementById('listings-sections');
  if (!navEl || !sectionsEl) return;

  try {
    const res  = await fetch('data/listings.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Register all listings by id
    data.categories.forEach(cat =>
      cat.listings.forEach(l => listingRegistry.set(l.id, l))
    );

    navEl.innerHTML      = renderCatNav(data.categories);
    sectionsEl.innerHTML = data.categories.map(renderSection).join('');

    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 50);
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

document.addEventListener('DOMContentLoaded', async () => {
  await loadListings();
  initCarousels();
  initModal();
});
