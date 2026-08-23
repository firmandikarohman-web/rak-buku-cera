document.addEventListener('DOMContentLoaded', () => {
    console.log("Rak Buku Cera Store script loaded.");
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // update cart count on load
    updateCartCount();

    // Call fetchBooks if we are on the homepage
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        fetchBooks();
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => {
        observer.observe(el);
    });
});

// CART LOGIC
function getCart() {
    const cart = localStorage.getItem('cera_cart');
    return cart ? JSON.parse(cart) : [];
}

function updateCartCount() {
    const cart = getCart();
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.innerText = cart.length > 0 ? `(${cart.length})` : '';
    }
}

function addToCart(bookId) {
    const cart = getCart();
    if (!cart.includes(bookId)) {
        cart.push(bookId);
        localStorage.setItem('cera_cart', JSON.stringify(cart));
        updateCartCount();
        alert("Buku berhasil ditambahkan ke keranjang!");
    } else {
        alert("Buku sudah ada di keranjang!");
    }
}

function removeFromCart(bookId) {
    let cart = getCart();
    cart = cart.filter(id => id !== bookId);
    localStorage.setItem('cera_cart', JSON.stringify(cart));
    updateCartCount();
    // Refresh cart page if we are on it
    if (window.location.pathname === '/cart' || window.location.pathname === '/cart.html') {
        fetchCartItems();
    }
}

async function fetchBooks() {
    try {
        const response = await fetch('/api/books');
        const books = await response.json();
        
        const booksGrid = document.querySelector('.books-grid');
        if (!booksGrid) return;
        
        booksGrid.innerHTML = '';
        
        if (books.length === 0) {
            booksGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Belum ada buku di katalog.</p>';
            return;
        }

        books.forEach(book => {
            const bookCard = `
                <div class="glass-card book-card" style="padding: 24px; border-radius: 20px; text-align: center; transition: transform 0.3s ease; display:flex; flex-direction:column; height: 100%;">
                    <img src="${book.coverImage || 'https://via.placeholder.com/200x280?text=Cover+Buku'}" alt="Cover Buku" style="width: 100%; aspect-ratio: 1 / 1.4; object-fit: cover; border-radius: 12px; margin-bottom: 20px; background-color: rgba(0,0,0,0.05); box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <h3 style="font-size: 1.2rem; margin-bottom: 8px; font-weight: bold; line-height: 1.4;">${book.title}</h3>
                    <p style="color: var(--text-secondary); font-weight: 600; font-size: 1.1rem; margin-bottom: 20px; margin-top: auto;">Rp ${book.price.toLocaleString('id-ID')}</p>
                    <div style="display: flex; gap: 12px; flex-direction: column;">
                        <button class="btn-cart" onclick="addToCart('${book._id}')">Tambah ke Keranjang</button>
                        <a href="/detail?id=${book._id}" class="btn-cart btn-outline">Detail Buku</a>
                    </div>
                </div>
            `;
            booksGrid.innerHTML += bookCard;
        });
    } catch (error) {
        console.error("Gagal mengambil data buku:", error);
    }
}

async function fetchBookDetail(bookId) {
    try {
        const response = await fetch(`/api/books/${bookId}`);
        if (!response.ok) {
            throw new Error('Buku tidak ditemukan');
        }
        const book = await response.json();
        const container = document.getElementById('detail-container');
        
        container.innerHTML = `
            <div class="blog-header reveal-stagger in-view">
                <h1 class="blog-title" style="font-family: 'Playfair Display', serif;">${book.title}</h1>
                <div class="blog-meta">Oleh: ${book.author} | Rp ${book.price.toLocaleString('id-ID')}</div>
            </div>
            
            <article class="blog-content reveal-stagger in-view">
                <img src="${book.coverImage || 'https://via.placeholder.com/300x420?text=Cover+Buku'}" alt="Cover Buku" style="width: 250px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); margin-bottom: 40px; margin-top: -20px;">
                
                <div class="desc-container" style="cursor: pointer; margin-bottom: 40px; width: 100%; text-align: justify;" onclick="const d=this.querySelector('.desc'); d.style.webkitLineClamp = d.style.webkitLineClamp === 'unset' ? '4' : 'unset'; const t=this.querySelector('.read-more-text'); t.innerHTML = d.style.webkitLineClamp === 'unset' ? '<i data-feather=\\'chevron-up\\' style=\\'width: 16px; height: 16px; vertical-align: middle;\\'></i> Sembunyikan' : '<i data-feather=\\'chevron-down\\' style=\\'width: 16px; height: 16px; vertical-align: middle;\\'></i> Baca selengkapnya'; feather.replace();">
                    <p class="desc" style="display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 10px; line-height: 1.8; color: var(--text-secondary); transition: all 0.3s ease;">
                        ${book.description || 'Tidak ada deskripsi untuk buku ini.'}
                    </p>
                    <span class="read-more-text" style="color: var(--text-primary); font-size: 0.95rem; font-weight: bold; opacity: 0.8; display: inline-block; margin-top: 5px;"><i data-feather="chevron-down" style="width: 16px; height: 16px; vertical-align: middle;"></i> Baca selengkapnya</span>
                </div>
                
                <button class="btn-cart" style="align-self: center;" onclick="addToCart('${book._id}')">Tambah ke Keranjang</button>
            </article>
        `;
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    } catch (error) {
        document.getElementById('detail-container').innerHTML = '<p style="text-align: center; width: 100%;">Gagal memuat detail buku.</p>';
        console.error("Gagal mengambil detail buku:", error);
    }
}

async function fetchCartItems() {
    try {
        const cart = getCart();
        const container = document.getElementById('cart-container');
        if (!container) return;
        
        if (cart.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px 0;">Keranjang belanja Anda kosong.</p>';
            return;
        }

        // Fetch all books
        const response = await fetch('/api/books');
        const allBooks = await response.json();
        
        // Filter only books in cart
        const cartBooks = allBooks.filter(book => cart.includes(book._id.toString()));
        
        container.innerHTML = '';
        let total = 0;
        
        cartBooks.forEach(book => {
            total += book.price;
            container.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <img src="${book.coverImage || 'https://via.placeholder.com/80x110?text=Cover'}" alt="Cover">
                        <div>
                            <h4>${book.title}</h4>
                            <p class="price" style="color: var(--text-secondary); font-weight: bold; margin-top: 5px;">Rp ${book.price.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    <button class="btn-cart btn-remove" onclick="removeFromCart('${book._id}')">Hapus</button>
                </div>
            `;
        });
        
        if (cartBooks.length > 0) {
            container.innerHTML += `
                <div class="cart-summary">
                    <h3>Total: Rp ${total.toLocaleString('id-ID')}</h3>
                    <button class="btn-cart" onclick="alert('Checkout belum diimplementasi')">Checkout</button>
                </div>
            `;
        }
    } catch (error) {
        document.getElementById('cart-container').innerHTML = '<p style="text-align: center;">Gagal memuat data keranjang.</p>';
        console.error("Gagal memuat keranjang:", error);
    }
}
