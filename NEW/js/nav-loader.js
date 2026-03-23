// Loads the shared nav partial into pages and attaches mobile toggle behavior
(async function(){
  try {
    const res = await fetch('partials/nav.tpl');
    if (!res.ok) return;
    const html = await res.text();
    const placeholder = document.getElementById('site-nav-placeholder');
    if (!placeholder) return;
    placeholder.innerHTML = html;

    // Inject dropdown CSS (works on every page without per-page style blocks)
    const style = document.createElement('style');
    style.textContent = `
      .nav-links .dropdown { position: relative; }
      .nav-links .dropdown-menu { display: none; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); background: var(--green-dark, #283318); min-width: 210px; list-style: none; padding: 0.5rem 0; box-shadow: 0 8px 24px rgba(0,0,0,0.35); border-top: 2px solid var(--amber, #c8953a); z-index: 1001; }
      .nav-links .dropdown:hover .dropdown-menu { display: block; }
      .nav-links .dropdown-menu li a { display: block; padding: 0.5rem 1.25rem; font-family: 'NativeRecordSans', sans-serif; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(221,217,188,0.75); opacity: 1; white-space: nowrap; transition: color 0.2s, background 0.2s; }
      .nav-links .dropdown-menu li a:hover { background: rgba(255,255,255,0.07); color: #ddd9bc; }
      .mobile-menu .sub-links { padding-left: 1rem; display: flex; flex-direction: column; gap: 0.3rem; margin-top: -0.25rem; margin-bottom: 0.25rem; }
      .mobile-menu .sub-links a { font-family: 'NativeRecordSans', sans-serif; font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.55); padding: 0.2rem 0; border-bottom: none !important; }
    `;
    document.head.appendChild(style);

    const hamburger = placeholder.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    function toggleMenu(){
      if (!mobileMenu) return;
      mobileMenu.classList.toggle('open');
    }

    if (hamburger) hamburger.addEventListener('click', toggleMenu);

    // Close mobile menu when a mobile link is clicked
    const mobileLinks = placeholder.querySelectorAll('.mobile-menu a');
    mobileLinks.forEach(a => a.addEventListener('click', ()=>{
      if (mobileMenu) mobileMenu.classList.remove('open');
    }));

    // Mark active link based on current file name
    const current = location.pathname.split('/').pop() || 'index.html';
    placeholder.querySelectorAll('.nav-links a').forEach(a=>{
      const href = a.getAttribute('href') || '';
      if (href.split('#')[0] === current) a.classList.add('active');
    });

  } catch (e) {
    console.error('nav-loader error', e);
  }
})();
