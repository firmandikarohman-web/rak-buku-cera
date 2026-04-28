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
        if (blobWrapper) {
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
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            } else {
                // Biarkan elemen "menjauh" (pudar) saat tidak terlihat
                // Ini memberikan efek mengalir saat scrolling
                entry.target.classList.remove('in-view');
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
            el.parentElement.classList.contains('minimal-book-list')) {
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
            if(data.targetList) {
                renderTargetList(data.targetList);
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
            <div class="currently-reading-card">
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
            <div class="book-card reveal-stagger">
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
            </div>
            `;
        }).join('');

        observeElements(container);
    };

    const renderTargetList = (books) => {
        const container = document.getElementById('target-list-container');
        if (!container || !books || books.length === 0) {
            if(container) container.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Belum ada buku dalam Target List.</p>';
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
            <div class="book-card reveal-stagger">
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
                        <div class="progress-fill" style="width: 0%" data-progress="${book.progress || 0}"></div>
                    </div>
                    <div class="progress-text">${book.progress || 0}%</div>
                </div>

                <div class="dual-review">
                    ${rohmanReview}
                    ${margiReview}
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

    // Start fetching
    fetchData();

});