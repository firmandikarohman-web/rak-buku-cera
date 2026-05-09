document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Mobile Menu Toggle ---
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    menuBtn.addEventListener('click', () => {
        navLinksContainer.classList.toggle('active');
        if (navLinksContainer.classList.contains('active')) {
            menuBtn.innerHTML = '<i data-feather="x"></i>';
        } else {
            menuBtn.innerHTML = '<i data-feather="menu"></i>';
        }
        feather.replace();
    });

    // Close menu when a link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinksContainer.classList.contains('active')) {
                navLinksContainer.classList.remove('active');
                menuBtn.innerHTML = '<i data-feather="menu"></i>';
                feather.replace();
            }
        });
    });


    // --- 2. Parallax Blobs ---
    const blobWrapper = document.getElementById('blobWrapper');
    let rafId;

    window.addEventListener('scroll', () => {
        if (blobWrapper && window.innerWidth > 768) {
            // Use requestAnimationFrame for smoother performance
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                // Sangat lambat dan halus
                blobWrapper.style.transform = `translateY(${scrolled * 0.15}px)`;
            });
        }
    });

    // --- 3. Enhanced Reveal Animation (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.reveal-stagger');

    const revealObserver = new IntersectionObserver((entries) => {
        const isMobile = window.innerWidth <= 768;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            } else {
                // Biarkan elemen "menjauh" (pudar) saat tidak terlihat
                // Ini memberikan efek mengalir saat scrolling
                if (isMobile) {
                    const isCard = entry.target.tagName.toLowerCase() === 'div' ||
                        entry.target.classList.contains('book-card-wrapper') ||
                        entry.target.classList.contains('gallery-card');
                    if (!isCard) {
                        entry.target.classList.remove('in-view');
                    }
                } else {
                    entry.target.classList.remove('in-view');
                }
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
    });

    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                fill.style.width = fill.getAttribute('data-progress') + '%';
            }
        });
    }, {
        root: null,
        threshold: 0.1
    });

    revealElements.forEach((el) => {
        // Otomatisasi stagger delay berdasarkan posisi dalam grup
        if (el.parentElement.classList.contains('fluid-icons') ||
            el.parentElement.classList.contains('bento-grid') ||
            el.parentElement.classList.contains('minimal-book-list') ||
            el.parentElement.classList.contains('gallery-grid') ||
            el.parentElement.classList.contains('bookshelf-grid')) {
            const index = Array.from(el.parentElement.children).indexOf(el);
            el.style.transitionDelay = `${index * 0.1}s`;
        }

        revealObserver.observe(el);
    });

    // Trigger hero animation immediately since it's above fold
    setTimeout(() => {
        const heroElements = document.querySelectorAll('#home .reveal-stagger');
        heroElements.forEach(el => el.classList.add('in-view'));
    }, 100);


    // --- 4. Magnetic Hover Effect ---
    const initMagneticEffects = () => {
        if (window.matchMedia("(pointer: fine)").matches) {
            const magneticElements = document.querySelectorAll('.magnetic, .magnetic-row');

            magneticElements.forEach(elem => {
                // Remove existing listener if any to avoid duplicates
                elem.removeEventListener('mousemove', handleMagneticMove);
                elem.removeEventListener('mouseleave', handleMagneticLeave);

                elem.addEventListener('mousemove', handleMagneticMove);
                elem.addEventListener('mouseleave', handleMagneticLeave);
            });
        }
    };

    function handleMagneticMove(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const strength = this.classList.contains('magnetic-row') ? 0.05 : 0.3;
        const deltaX = (x - centerX) * strength;
        const deltaY = (y - centerY) * strength;

        let scale = this.classList.contains('fluid-icon') ? 1.1 : 1.0;
        this.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
    }

    function handleMagneticLeave() {
        this.style.transform = ``;
    }

    initMagneticEffects();

    // --- 5. Sticky Nav Background on Scroll ---
    const nav = document.querySelector('.sticky-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // --- 6. Scroll Spy ---
    const sections = document.querySelectorAll('.section-scroll');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    // --- 7. Dynamic Data Connection ---
    // --- 7. Reusable Carousel Handler ---
    class CarouselHandler {
        constructor(containerId, data, renderItemFn) {
            this.container = document.getElementById(containerId);
            if (!this.container) return;
            this.wrapper = this.container.parentElement;
            this.data = data;
            this.renderItemFn = renderItemFn;
            this.currentIndex = 0;
            this.interval = null;
            this.init();
        }

        init() {
            this.render();
            this.startAutoSlide();
            this.setupNavigation();
            this.setupHoverPause();
        }

        render() {
            this.container.innerHTML = this.data.map((item, index) => this.renderItemFn(item, index)).join('');
            feather.replace();
        }

        startAutoSlide() {
            if (this.interval) clearInterval(this.interval);
            this.interval = setInterval(() => this.next(), 2000); // 2 seconds
        }

        next() {
            this.currentIndex = (this.currentIndex + 1) % this.data.length;
            this.updateSlider();
        }

        prev() {
            this.currentIndex = (this.currentIndex - 1 + this.data.length) % this.data.length;
            this.updateSlider();
        }

        updateSlider() {
            this.container.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        }

        setupNavigation() {
            const prevBtn = this.wrapper.querySelector('.nav-btn.prev');
            const nextBtn = this.wrapper.querySelector('.nav-btn.next');

            if (prevBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.prev();
                    this.startAutoSlide();
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.next();
                    this.startAutoSlide();
                });
            }
        }

        setupHoverPause() {
            this.wrapper.addEventListener('mouseenter', () => clearInterval(this.interval));
            this.wrapper.addEventListener('mouseleave', () => this.startAutoSlide());
        }
    }

    // --- 8. Dynamic Data Connection ---
    const fetchData = async () => {
        try {
            const response = await fetch('data/data.json');
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();

            // Setup Activities Carousel (Memories)
            if (data.activities && data.activities.length > 0) {
                new CarouselHandler('activities-list', data.activities, (act) => `
                    <div class="carousel-item">
                        <div class="carousel-image-container">
                            <img src="${act.image || 'https://via.placeholder.com/400x225?text=Memory'}" 
                                 alt="${act.title}" class="carousel-image"
                                 onerror="this.src='https://via.placeholder.com/400x225?text=Memory'">
                        </div>
                        <div class="carousel-info">
                            <p class="date">${act.date}</p>
                            <h4>${act.title}</h4>
                            <p>${act.location}</p>
                        </div>
                    </div>
                `);
            } else {
                // Handle empty activities gracefully
                const container = document.getElementById('activities-list');
                if (container) {
                    container.innerHTML = '<div class="carousel-item"><div class="carousel-info" style="text-align:center; padding: 40px; width: 100%;"><p>Belum ada dokumentasi. Akan segera diisi!</p></div></div>';
                }
            }

            renderCurrentlyReading(data.currentlyReading);
            renderReadingList(data.readingList);
            if (data.targetList) {
                renderTargetList(data.targetList);
            }
            if (data.gallery) {
                renderGallery(data.gallery);
            }

            // Re-initialize for new elements
            feather.replace();
            initMagneticEffects();

        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const renderCurrentlyReading = (book) => {
        const container = document.getElementById('currently-reading-container');
        if (!container || !book) return;

        container.innerHTML = `
            <div class="currently-reading-wrapper" style="width: 100%; max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px;">
                <div class="currently-reading-card" style="margin: 0; max-width: 100%;">
                    <img src="${book.cover}" alt="${book.title}" class="cr-cover" onerror="this.src='https://via.placeholder.com/150x210?text=Cover'">
                    <div class="cr-info">
                        <h4>${book.title}</h4>
                        <p>${book.author}</p>
                        <div class="cr-progress-container">
                            <div class="cr-progress-fill" style="width: 0%" data-progress="${book.progress}"></div>
                        </div>
                        <div class="cr-progress-text">${book.progress}% Selesai</div>
                    </div>
                </div>
                <div class="cr-sinopsis" style="padding-top: 15px; border-top: 1px solid rgba(0, 0, 0, 0.05); text-align: left;">
                    <h5 style="margin-bottom: 8px; font-size: 0.95rem; color: var(--text-primary);">Sinopsis</h5>
                    <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); text-align: justify;">${book.sinopsis || "belum ada sinopsisnya"}</p>
                </div>
            </div>
        `;

        // Trigger animation for this specific progress bar
        setTimeout(() => {
            const fill = container.querySelector('.cr-progress-fill');
            if (fill) progressObserver.observe(fill);
        }, 100);
    };

    const renderReadingList = (books) => {
        const container = document.getElementById('reading-list-container');
        if (!container) return;

        container.innerHTML = books.map((book, index) => {
            const statusClass = book.status.toLowerCase() === 'completed' ? 'completed' : 'reading';
            const rohmanReview = book.reviews && book.reviews.rohman ? `
                <div class="review-item">
                    <div class="reviewer-name">Rohman <span class="rating">${book.reviews.rohman.rating}</span></div>
                    <div class="review-text">"${book.reviews.rohman.comment}"</div>
                </div>
            ` : '';
            const margiReview = book.reviews && book.reviews.margi ? `
                <div class="review-item">
                    <div class="reviewer-name">Margi <span class="rating">${book.reviews.margi.rating}</span></div>
                    <div class="review-text">"${book.reviews.margi.comment}"</div>
                </div>
            ` : '';

            return `
            <div class="book-card-wrapper reveal-stagger">
                <div class="book-card flip-enabled" onclick="this.classList.toggle('is-flipped')">
                    <div class="book-card-front">
                        <div class="book-card-header">
                            <img src="${book.cover}" alt="${book.title}" class="book-cover" onerror="this.src='https://via.placeholder.com/150x210?text=Cover'">
                            <div class="book-info">
                                <h4>${book.title}</h4>
                                <p class="book-author">${book.author}</p>
                                <span class="book-status ${statusClass}">${book.status}</span>
                            </div>
                        </div>
                        
                        <div class="progress-section">
                            <div class="progress-container">
                                <div class="progress-fill" style="width: 0%" data-progress="${book.progress}"></div>
                            </div>
                            <div class="progress-text">${book.progress}%</div>
                        </div>

                        <div class="dual-review">
                            ${rohmanReview}
                            ${margiReview}
                        </div>
                        <div style="margin-top: auto; padding-top: 10px; text-align: center; font-size: 0.75rem; color: var(--text-secondary); opacity: 0.6;">
                            <i data-feather="repeat" style="width: 12px; height: 12px; vertical-align: middle;"></i> Klik untuk Sinopsis
                        </div>
                    </div>
                    <div class="book-card-back">
                        <h5 style="margin-bottom: 10px; font-size: 1rem; color: var(--text-primary); border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 10px;">Sinopsis</h5>
                        <p style="font-size: 0.85rem; line-height: 1.6; color: var(--text-secondary); text-align: justify;">${book.sinopsis || "belum ada sinopsisnya"}</p>
                        <div style="margin-top: auto; padding-top: 15px; text-align: center; font-size: 0.75rem; color: var(--text-secondary); opacity: 0.6;">
                            <i data-feather="repeat" style="width: 12px; height: 12px; vertical-align: middle;"></i> Kembali
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        observeElements(container);
    };

    const renderTargetList = (books) => {
        const container = document.getElementById('target-list-container');
        if (!container || !books || books.length === 0) {
            if (container) container.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Belum ada buku dalam Target List.</p>';
            return;
        }

        container.innerHTML = books.map((book, index) => {
            const statusClass = book.status.toLowerCase() === 'completed' ? 'completed' : 'target';
            const rohmanReview = book.reviews && book.reviews.rohman ? `
                <div class="review-item">
                    <div class="reviewer-name">Rohman <span class="rating">${book.reviews.rohman.rating}</span></div>
                    <div class="review-text">"${book.reviews.rohman.comment}"</div>
                </div>
            ` : '';
            const margiReview = book.reviews && book.reviews.margi ? `
                <div class="review-item">
                    <div class="reviewer-name">Margi <span class="rating">${book.reviews.margi.rating}</span></div>
                    <div class="review-text">"${book.reviews.margi.comment}"</div>
                </div>
            ` : '';

            return `
            <div class="book-card-wrapper reveal-stagger">
                <div class="book-card">
                    <div class="book-card-header">
                        <img src="${book.cover}" alt="${book.title}" class="book-cover" onerror="this.src='https://via.placeholder.com/150x210?text=Cover'">
                        <div class="book-info">
                            <h4>${book.title}</h4>
                            <p class="book-author">${book.author}</p>
                            <span class="book-status ${statusClass}">${book.status}</span>
                        </div>
                    </div>

                    <div class="book-sinopsis" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0, 0, 0, 0.05);">
                        <h5 style="margin-bottom: 5px; font-size: 0.85rem; color: var(--text-primary);">Sinopsis</h5>
                        <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-secondary); text-align: justify;">${book.sinopsis || "belum ada sinopsisnya"}</p>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        observeElements(container);
    };

    const observeElements = (container) => {
        const elements = container.querySelectorAll('.reveal-stagger');
        elements.forEach((el, index) => {
            el.style.transitionDelay = `${index * 0.1}s`;
            revealObserver.observe(el);
        });

        const progressBars = container.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => progressObserver.observe(bar));
    };

    const renderGallery = (galleryItems) => {
        const container = document.getElementById('gallery-container');
        if (!container || !galleryItems || galleryItems.length === 0) {
            if (container) container.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Belum ada foto di galeri.</p>';
            return;
        }

        container.innerHTML = galleryItems.map((item) => {
            return `
            <div class="gallery-card reveal-stagger">
                <img src="${item.image}" alt="${item.title}" class="gallery-img" onerror="this.src='https://via.placeholder.com/600x800?text=Gallery'">
            </div>
            `;
        }).join('');

        observeElements(container);
    };

    // Start fetching
    fetchData();

});
