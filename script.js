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

            // Clear search when navigating so hidden sections reappear
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.value !== '') {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
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
                // Biarkan elemen tetap terlihat di ponsel setelah muncul pertama kali
                // Ini mencegah glitch di mana h2 atau teks lain tertutup saat mengeklik card
                if (!isMobile) {
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

        if (window.innerWidth > 1024) {
            const splitElements = document.querySelectorAll('.desktop-split .reveal-stagger');
            splitElements.forEach(el => el.classList.add('in-view'));
        } else {
            const tagline = document.querySelectorAll('#home-desc .reveal-stagger');
            tagline.forEach(el => el.classList.add('in-view'));
        }
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
        constructor(containerId, data, renderItemFn, autoSlideMs = 0) {
            this.container = document.getElementById(containerId);
            if (!this.container) return;
            this.wrapper = this.container.parentElement;
            this.data = data;
            this.renderItemFn = renderItemFn;
            this.autoSlideMs = autoSlideMs;
            this.currentIndex = 0;
            this.interval = null;
            this.init();
        }

        init() {
            this.render();
            if (this.autoSlideMs > 0) {
                this.startAutoSlide();
                this.setupHoverPause();
            }
            this.setupNavigation();
        }

        render() {
            this.container.innerHTML = this.data.map((item, index) => this.renderItemFn(item, index)).join('');
            feather.replace();
        }

        startAutoSlide() {
            if (this.interval) clearInterval(this.interval);
            if (this.autoSlideMs > 0) {
                this.interval = setInterval(() => this.next(), this.autoSlideMs);
            }
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
            if (this.autoSlideMs > 0) {
                this.wrapper.addEventListener('mouseenter', () => clearInterval(this.interval));
                this.wrapper.addEventListener('mouseleave', () => this.startAutoSlide());
            }
        }
    }

    // --- 8. Dynamic Data Connection ---
    let globalData = null;
    const fetchData = async () => {
        try {
            const response = await fetch('data/data.json');
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            globalData = data;

            // Setup Activities Carousel (Memories)
            if (data.activities && data.activities.length > 0) {
                new CarouselHandler('activities-list', data.activities, (act) => `
                    <div class="carousel-item">
                        <div class="carousel-image-container img-loading-wrapper is-loading" style="display: flex;">
                            <div class="loading-icon-container">
                                <i data-feather="image"></i>
                                <span class="loading-text">Memuat</span>
                            </div>
                            <img src="${act.image || 'https://via.placeholder.com/400x225?text=Memory'}" 
                                 alt="${act.title}" class="carousel-image"
                                 onload="this.parentElement.classList.remove('is-loading')"
                                 onerror="this.parentElement.classList.remove('is-loading'); this.src='https://via.placeholder.com/400x225?text=Memory'">
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

    const renderCurrentlyReading = (books) => {
        const container = document.getElementById('currently-reading-container');
        if (!container || !books) return;

        const booksArray = Array.isArray(books) ? books : [books];
        if (booksArray.length === 0) return;

        if (booksArray.length > 1) {
            container.innerHTML = `
                <div class="carousel-wrapper cr-carousel">
                    <div class="carousel-inner" id="cr-carousel-inner">
                    </div>
                    <button class="nav-btn prev" aria-label="Previous"><i data-feather="chevron-left"></i></button>
                    <button class="nav-btn next" aria-label="Next"><i data-feather="chevron-right"></i></button>
                </div>
            `;
            new CarouselHandler('cr-carousel-inner', booksArray, (book) => `
                <div class="carousel-item">
                    <div class="currently-reading-wrapper" style="width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; padding: 0 10px;">
                        <div class="currently-reading-card" style="margin: 0; max-width: 100%;">
                            <div class="img-loading-wrapper is-loading" style="border-radius: 12px; flex-shrink: 0;">
                                <div class="loading-icon-container">
                                    <i data-feather="book-open"></i>
                                    <span class="loading-text">Memuat</span>
                                </div>
                                <img src="${book.cover}" alt="${book.title}" class="cr-cover" onload="this.parentElement.classList.remove('is-loading')" onerror="this.parentElement.classList.remove('is-loading'); this.src='https://via.placeholder.com/150x210?text=Cover'">
                            </div>
                            <div class="cr-info">
                                <h4>${book.title}</h4>
                                <p>${book.author}</p>
                                <div class="cr-progress-container">
                                    <div class="cr-progress-fill" style="width: 0%" data-progress="${book.progress}"></div>
                                </div>
                                <div class="cr-progress-text">${book.progress}% Selesai</div>
                            </div>
                        </div>
                        <div class="cr-sinopsis book-sinopsis" style="padding-top: 15px; padding-bottom: 15px; border-top: 1px solid rgba(0, 0, 0, 0.05); text-align: left; max-height: 370px; overflow-y: auto;">
                            <h5 style="margin-bottom: 8px; font-size: 0.95rem; color: var(--text-primary);">Sinopsis</h5>
                            <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); text-align: justify; margin: 0;">${book.sinopsis || "belum ada sinopsisnya"}</p>
                        </div>
                    </div>
                </div>
            `);
        } else {
            const book = booksArray[0];
            container.innerHTML = `
                <div class="currently-reading-wrapper" style="width: 100%; max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px;">
                    <div class="currently-reading-card" style="margin: 0; max-width: 100%;">
                        <div class="img-loading-wrapper is-loading" style="border-radius: 12px; flex-shrink: 0;">
                            <div class="loading-icon-container">
                                <i data-feather="book-open"></i>
                                <span class="loading-text">Memuat</span>
                            </div>
                            <img src="${book.cover}" alt="${book.title}" class="cr-cover" onload="this.parentElement.classList.remove('is-loading')" onerror="this.parentElement.classList.remove('is-loading'); this.src='https://via.placeholder.com/150x210?text=Cover'">
                        </div>
                        <div class="cr-info">
                            <h4>${book.title}</h4>
                            <p>${book.author}</p>
                            <div class="cr-progress-container">
                                <div class="cr-progress-fill" style="width: 0%" data-progress="${book.progress}"></div>
                            </div>
                            <div class="cr-progress-text">${book.progress}% Selesai</div>
                        </div>
                    </div>
                    <div class="cr-sinopsis book-sinopsis" style="padding-top: 15px; border-top: 1px solid rgba(0, 0, 0, 0.05); text-align: left; max-height: 180px; overflow-y: auto;">
                        <h5 style="margin-bottom: 8px; font-size: 0.95rem; color: var(--text-primary);">Sinopsis</h5>
                        <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); text-align: justify; margin: 0;">${book.sinopsis || "belum ada sinopsisnya"}</p>
                    </div>
                </div>
            `;
            feather.replace();
        }

        // Trigger animation for ALL progress bars (including carousel slides)
        setTimeout(() => {
            const fills = container.querySelectorAll('.cr-progress-fill');
            fills.forEach(fill => progressObserver.observe(fill));
        }, 100);
    };

    const renderReadingList = (books) => {
        const container = document.getElementById('reading-list-container');
        if (!container) return;

        if (!books || books.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary); grid-column: 1 / -1; padding: 40px 0;">Yahh, belum ada di daftar bacaan</p>';
            return;
        }

        container.innerHTML = books.map((book, index) => {
            let statusClass = 'reading';
            const stat = book.status.toLowerCase();
            if (stat === 'completed') statusClass = 'completed';
            else if (stat === 'unread' || stat === 'target') statusClass = 'target';
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
                            <div class="img-loading-wrapper is-loading" style="border-radius: 8px;">
                                <div class="loading-icon-container">
                                    <i data-feather="book-open"></i>
                                </div>
                                <img src="${book.cover}" alt="${book.title}" class="book-cover" onload="this.parentElement.classList.remove('is-loading')" onerror="this.parentElement.classList.remove('is-loading'); this.src='https://via.placeholder.com/150x210?text=Cover'">
                            </div>
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
                        <div class="img-loading-wrapper is-loading" style="border-radius: 8px;">
                            <div class="loading-icon-container">
                                <i data-feather="book-open"></i>
                            </div>
                            <img src="${book.cover}" alt="${book.title}" class="book-cover" onload="this.parentElement.classList.remove('is-loading')" onerror="this.parentElement.classList.remove('is-loading'); this.src='https://via.placeholder.com/150x210?text=Cover'">
                        </div>
                        <div class="book-info">
                            <h4>${book.title}</h4>
                            <p class="book-author">${book.author}</p>
                            <span class="book-status ${statusClass}">${book.status}</span>
                        </div>
                    </div>

                    <div class="book-sinopsis" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0, 0, 0, 0.05); flex: 1; overflow-y: auto;">
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
            <div class="gallery-card-wrapper reveal-stagger">
                <div class="gallery-card flip-enabled" onclick="this.classList.toggle('is-flipped')">
                    <div class="gallery-card-front">
                        <div class="img-loading-wrapper is-loading" style="width: 100%; height: 100%; border-radius: inherit;">
                            <div class="loading-icon-container">
                                <i data-feather="image"></i>
                            </div>
                            <img src="${item.image}" alt="${item.title}" class="gallery-img" onload="this.parentElement.classList.remove('is-loading')" onerror="this.parentElement.classList.remove('is-loading'); this.src='https://via.placeholder.com/600x800?text=Gallery'">
                        </div>
                        <div style="position: absolute; bottom: 10px; width: 100%; text-align: center; font-size: 0.75rem; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.8); z-index: 10;">
                            <i data-feather="repeat" style="width: 12px; height: 12px; vertical-align: middle;"></i> Klik untuk Senandika
                        </div>
                    </div>
                    <div class="gallery-card-back">
                        <h5 style="margin-bottom: 10px; font-size: 1rem; color: var(--text-primary); border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 10px;">Senandika</h5>
                        <p style="font-size: 0.85rem; line-height: 1.6; color: var(--text-secondary); text-align: justify;">${item.senandika || "Belum ada senandika untuk foto ini."}</p>
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

    // Start fetching
    fetchData();

    // --- Search Functionality ---
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (!globalData) return;

            const filterBooks = (books) => {
                if (!books) return [];
                return books.filter(book =>
                    book.title.toLowerCase().includes(query) ||
                    (book.author && book.author.toLowerCase().includes(query)) ||
                    (book.sinopsis && book.sinopsis.toLowerCase().includes(query))
                );
            };

            const isSearching = query.length > 0;
            const sectionsToHide = ['home', 'about', 'gallery', 'contact'];

            sectionsToHide.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = isSearching ? 'none' : '';
            });

            const desktopSplit = document.querySelector('.desktop-split');
            if (desktopSplit) desktopSplit.style.display = isSearching ? 'none' : '';

            const targetListSection = document.getElementById('target-list');
            if (targetListSection) {
                targetListSection.style.display = isSearching ? 'none' : '';
            }

            const readingListTitle = document.querySelector('#reading-list .section-title');
            if (readingListTitle) {
                readingListTitle.innerHTML = isSearching ? 'Hasil Pencarian' : 'Jejak Baca';
            }

            // Scroll to top of results if starting to search
            if (isSearching && query.length === 1) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            if (isSearching) {
                let combinedBooks = [];
                if (globalData.readingList) combinedBooks.push(...globalData.readingList);
                if (globalData.targetList) combinedBooks.push(...globalData.targetList);
                renderReadingList(filterBooks(combinedBooks));
            } else {
                renderReadingList(globalData.readingList);
                if (globalData.targetList) {
                    renderTargetList(globalData.targetList);
                }
            }

            feather.replace();

            if (window.matchMedia("(pointer: fine)").matches) {
                // Remove existing listener if any to avoid duplicates
                const magneticElements = document.querySelectorAll('.magnetic, .magnetic-row');
                magneticElements.forEach(elem => {
                    elem.removeEventListener('mousemove', handleMagneticMove);
                    elem.removeEventListener('mouseleave', handleMagneticLeave);
                    elem.addEventListener('mousemove', handleMagneticMove);
                    elem.addEventListener('mouseleave', handleMagneticLeave);
                });
            }
        });
    }

});
