// =================================================================
// MAIN JAVASCRIPT - Data Scientist Portfolio
// Shared behavior + page-specific features
// =================================================================

(function () {
    'use strict';

    const THEME_STORAGE_KEY = 'portfolio-theme';
    const THEME_LIGHT = 'light';
    const THEME_DARK = 'dark';
    let themeSystemListenerBound = false;

    applyTheme(getInitialTheme());

    function resolveComponentUrl(url) {
        const cleanPath = String(url || '').replace(/^\.?\//, '');
        try {
            return new URL(cleanPath, document.baseURI).toString();
        } catch (error) {
            return cleanPath;
        }
    }

    function fetchComponentMarkup(url) {
        const resolvedUrl = resolveComponentUrl(url);

        // Force fresh header/footer after edits while still supporting a fallback retry.
        return fetch(resolvedUrl, { cache: 'no-store' })
            .catch(function () {
                return fetch(resolvedUrl);
            })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response.text();
            });
    }

    function isExpectedComponentMarkup(html, containerId) {
        if (!html || typeof html !== 'string') {
            return false;
        }

        if (containerId === 'header-container') {
            return /<nav[\s>]/i.test(html);
        }

        if (containerId === 'footer-container') {
            return /<footer[\s>]/i.test(html);
        }

        return true;
    }

    function loadComponent(url, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            return Promise.resolve();
        }

        return fetchComponentMarkup(url)
            .then((html) => {
                if (!isExpectedComponentMarkup(html, containerId)) {
                    throw new Error('Unexpected component response for ' + containerId);
                }
                container.innerHTML = html;
            })
            .catch((error) => {
                console.error('Component load error:', error);
                container.innerHTML =
                    '<div class="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-xl">' +
                    '<i class="fas fa-exclamation-triangle text-3xl mb-4"></i>' +
                    '<p>Component failed to load</p>' +
                    '</div>';
            });
    }

    window.addEventListener('load', function () {
        Promise.all([
            loadComponent('components/header.html', 'header-container'),
            loadComponent('components/footer.html', 'footer-container')
        ]).finally(function () {
            initComponents();
        });
    });

    function initComponents() {
        initThemeToggle();
        initNavigation();
        initSmoothScroll();
        initScrollEffects();
        initAnimations();
        initFormValidation();
        initBackToTop();
        initActiveNav();
        initProjectsCarousel();
        initAnalyticsCounters();
        console.log('All components initialized');
    }

    function getStoredTheme() {
        try {
            const stored = localStorage.getItem(THEME_STORAGE_KEY);
            if (stored === THEME_LIGHT || stored === THEME_DARK) {
                return stored;
            }
        } catch (error) {
            console.warn('Theme storage unavailable', error);
        }
        return null;
    }

    function setStoredTheme(theme) {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (error) {
            console.warn('Theme storage unavailable', error);
        }
    }

    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return THEME_DARK;
        }
        return THEME_LIGHT;
    }

    function getInitialTheme() {
        return getStoredTheme() || getSystemTheme();
    }

    function applyTheme(theme) {
        const nextTheme = theme === THEME_DARK ? THEME_DARK : THEME_LIGHT;
        document.documentElement.setAttribute('data-theme', nextTheme);
    }

    function isDarkTheme() {
        return document.documentElement.getAttribute('data-theme') === THEME_DARK;
    }

    function updateThemeToggleUI() {
        const isDark = isDarkTheme();
        const buttons = document.querySelectorAll('[data-theme-toggle]');
        buttons.forEach(function (button) {
            const icon = button.querySelector('i');
            const label = button.querySelector('[data-theme-label]');
            const ariaLabel = isDark ? 'Switch to light theme' : 'Switch to dark theme';

            button.setAttribute('aria-label', ariaLabel);
            button.setAttribute('title', ariaLabel);

            if (icon) {
                icon.classList.toggle('fa-moon', !isDark);
                icon.classList.toggle('fa-sun', isDark);
            }

            if (label) {
                label.textContent = isDark ? 'Light mode' : 'Dark mode';
            }
        });
    }

    function toggleTheme() {
        const nextTheme = isDarkTheme() ? THEME_LIGHT : THEME_DARK;
        applyTheme(nextTheme);
        setStoredTheme(nextTheme);
        updateThemeToggleUI();
    }

    function bindSystemThemeListener() {
        if (themeSystemListenerBound || !window.matchMedia) {
            return;
        }

        const query = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = function (event) {
            if (getStoredTheme()) {
                return;
            }
            applyTheme(event.matches ? THEME_DARK : THEME_LIGHT);
            updateThemeToggleUI();
        };

        if (typeof query.addEventListener === 'function') {
            query.addEventListener('change', onChange);
        } else if (typeof query.addListener === 'function') {
            query.addListener(onChange);
        }

        themeSystemListenerBound = true;
    }

    function initThemeToggle() {
        const buttons = document.querySelectorAll('[data-theme-toggle]');
        if (!buttons.length) {
            return;
        }

        buttons.forEach(function (button) {
            if (button.dataset.themeBound === 'true') {
                return;
            }
            button.dataset.themeBound = 'true';
            button.addEventListener('click', function () {
                toggleTheme();
            });
        });

        updateThemeToggleUI();
        bindSystemThemeListener();
    }

    function initNavigation() {
        const mobileBtn = document.getElementById('mobile-menu-btn-global');
        const mobileMenu = document.getElementById('mobile-menu-global');

        if (mobileBtn && mobileMenu) {
            mobileBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                mobileMenu.classList.toggle('hidden');
                const icon = mobileBtn.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-bars');
                    icon.classList.toggle('fa-times');
                }
            });

            document.addEventListener('click', function () {
                mobileMenu.classList.add('hidden');
                const icon = mobileBtn.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            });
        }

        const dropdownButtons = document.querySelectorAll('nav .group > button');
        dropdownButtons.forEach(function (button) {
            const dropdown = button.nextElementSibling;
            if (!dropdown) {
                return;
            }

            button.addEventListener('click', function (e) {
                e.stopPropagation();
                dropdown.classList.toggle('opacity-100');
                dropdown.classList.toggle('invisible');
            });
        });
    }

    function initSmoothScroll() {
        const anchors = document.querySelectorAll('a[href^="#"]');
        anchors.forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (!targetId || targetId.length <= 1) {
                    return;
                }

                const target = document.querySelector(targetId);
                if (!target) {
                    return;
                }

                e.preventDefault();
                const headerHeight = document.querySelector('nav') ? document.querySelector('nav').offsetHeight : 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            });
        });
    }

    function initScrollEffects() {
        window.addEventListener('scroll', throttle(function () {
            const navbar = document.querySelector('nav');
            if (!navbar) {
                return;
            }

            if (window.scrollY > 100) {
                navbar.classList.add('shadow-lg', 'bg-white/95');
            } else {
                navbar.classList.remove('shadow-lg', 'bg-white/95');
            }
        }, 16));

        window.addEventListener('scroll', throttle(function () {
            const hero = document.querySelector('.hero-section');
            if (!hero) {
                return;
            }
            hero.style.setProperty('--scroll', String(window.pageYOffset * 0.3) + 'px');
        }, 16));
    }

    function initAnimations() {
        if (!('IntersectionObserver' in window)) {
            return;
        }

        const observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slide-up');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('section').forEach(function (el) {
            observer.observe(el);
        });
    }

    function initFormValidation() {
        const form = document.querySelector('form#contact-form');
        if (!form || form.dataset.bound === 'true') {
            return;
        }
        form.dataset.bound = 'true';

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            validateAndSubmit(form);
        });
    }

    function validateAndSubmit(form) {
        const name = form.querySelector('#name') ? form.querySelector('#name').value.trim() : '';
        const email = form.querySelector('#email') ? form.querySelector('#email').value.trim() : '';
        const subject = form.querySelector('#subject') ? form.querySelector('#subject').value.trim() : '';
        const message = form.querySelector('#message') ? form.querySelector('#message').value.trim() : '';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name || !email || !message) {
            showNotification('Please fill in all required fields', 'error');
            return false;
        }

        if (form.querySelector('#subject') && !subject) {
            showNotification('Please select a project type', 'error');
            return false;
        }

        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return false;
        }

        if (message.length < 10) {
            showNotification('Message should be at least 10 characters', 'error');
            return false;
        }

        const btn = form.querySelector('button[type="submit"]');
        if (!btn) {
            return true;
        }

        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-3"></i>Sending...';
        btn.disabled = true;

        const payload = {
            name: name,
            email: email,
            subject: subject,
            message: message,
            page: window.location.href,
            userAgent: navigator.userAgent
        };

        const scriptUrl = getGoogleScriptUrl(form);
        if (!scriptUrl) {
            setTimeout(function () {
                showNotification('Form is ready. Add your Google Script URL to store responses in Google Sheets.', 'success');
                form.reset();
                btn.innerHTML = original;
                btn.disabled = false;
            }, 1200);
            return true;
        }

        submitToGoogleSheet(scriptUrl, payload)
            .then(function () {
                showNotification('Thank you! Your message has been saved and sent successfully.', 'success');
                form.reset();
            })
            .catch(function () {
                showNotification('Unable to submit right now. Please try again.', 'error');
            })
            .finally(function () {
                btn.innerHTML = original;
                btn.disabled = false;
            });

        return true;
    }

    function getGoogleScriptUrl(form) {
        const fromDataAttribute = form.getAttribute('data-google-script-url') || '';
        const fromWindow = typeof window.GOOGLE_SHEETS_WEB_APP_URL === 'string' ? window.GOOGLE_SHEETS_WEB_APP_URL : '';
        return (fromDataAttribute || fromWindow || '').trim();
    }

    function submitToGoogleSheet(scriptUrl, payload) {
        const params = new URLSearchParams();
        Object.keys(payload).forEach(function (key) {
            params.append(key, payload[key] || '');
        });

        return fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: params.toString()
        });
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className =
            'fixed top-6 right-6 z-[9999] p-6 rounded-2xl shadow-2xl transform ' +
            'translate-x-full transition-all duration-300 max-w-sm border-4 ' +
            (type === 'error'
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-400'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400');

        notification.innerHTML =
            '<div class="flex items-start gap-4">' +
            '<i class="fas ' + (type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle') + ' text-2xl mt-0.5 flex-shrink-0"></i>' +
            '<div class="leading-relaxed">' + message + '</div>' +
            '</div>';

        document.body.appendChild(notification);

        requestAnimationFrame(function () {
            notification.classList.remove('translate-x-full');
        });

        setTimeout(function () {
            notification.classList.add('translate-x-full');
            setTimeout(function () {
                notification.remove();
            }, 300);
        }, 4000);
    }

    function initBackToTop() {
        if (document.getElementById('back-to-top-btn')) {
            return;
        }

        const btn = document.createElement('button');
        btn.id = 'back-to-top-btn';
        btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        btn.className =
            'fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 ' +
            'text-white rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-110 ' +
            'transition-all duration-300 z-40 opacity-0 invisible translate-y-10 ' +
            'border-0 focus:outline-none focus:ring-4 focus:ring-blue-300';
        btn.setAttribute('aria-label', 'Back to top');
        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.body.appendChild(btn);

        window.addEventListener('scroll', throttle(function () {
            if (window.scrollY > 800) {
                btn.classList.remove('opacity-0', 'invisible', 'translate-y-10');
                btn.classList.add('opacity-100', 'visible', 'translate-y-0');
            } else {
                btn.classList.add('opacity-0', 'invisible', 'translate-y-10');
                btn.classList.remove('opacity-100', 'visible', 'translate-y-0');
            }
        }, 16));
    }

    function initActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        if (!sections.length || !navLinks.length) {
            return;
        }

        window.addEventListener('scroll', throttle(function () {
            let current = '';
            const scrollPos = window.scrollY + 100;

            sections.forEach(function (section) {
                if (scrollPos >= section.offsetTop) {
                    current = section.getAttribute('id') || '';
                }
            });

            navLinks.forEach(function (link) {
                link.classList.remove('text-blue-600', '!text-blue-600');
                const href = link.getAttribute('href') || '';
                if (href === '#' + current || href.endsWith('#' + current)) {
                    link.classList.add('text-blue-600', '!text-blue-600');
                }
            });
        }, 16));
    }

    function initProjectsCarousel() {
        const carousel = document.getElementById('projects-carousel');
        if (!carousel) {
            return;
        }

        let direction = 1;
        const speed = 0.45;
        let frameId = null;

        const tick = function () {
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            if (maxScroll > 0) {
                carousel.scrollLeft += speed * direction;

                if (carousel.scrollLeft >= maxScroll - 1) {
                    direction = -1;
                } else if (carousel.scrollLeft <= 1) {
                    direction = 1;
                }
            }

            frameId = requestAnimationFrame(tick);
        };

        const stop = function () {
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
            frameId = null;
        };

        const start = function () {
            if (!frameId) {
                frameId = requestAnimationFrame(tick);
            }
        };

        start();
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        carousel.addEventListener('touchstart', stop, { passive: true });
        carousel.addEventListener('touchend', start, { passive: true });
    }

    function initAnalyticsCounters() {
        const statsSection = document.querySelector('#stats');
        if (!statsSection || !('IntersectionObserver' in window)) {
            return;
        }

        const counters = statsSection.querySelectorAll('[data-target]');
        if (!counters.length) {
            return;
        }

        const animateCounter = function (el) {
            if (el.dataset.counted === 'true') {
                return;
            }
            el.dataset.counted = 'true';

            const rawTarget = el.getAttribute('data-target') || '0';
            const numericTarget = parseFloat(rawTarget.replace(/[^0-9.]/g, '')) || 0;
            const suffix = rawTarget.replace(/[0-9.]/g, '');
            const increment = numericTarget / 100;
            let current = 0;

            const timer = setInterval(function () {
                current += increment;
                if (current >= numericTarget) {
                    el.textContent = String(numericTarget) + suffix;
                    clearInterval(timer);
                } else {
                    el.textContent = String(Math.floor(current)) + suffix;
                }
            }, 30);
        };

        const observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    counters.forEach(animateCounter);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(statsSection);
    }

    function throttle(func, limit) {
        let inThrottle = false;
        return function () {
            if (!inThrottle) {
                func.apply(this, arguments);
                inThrottle = true;
                setTimeout(function () {
                    inThrottle = false;
                }, limit);
            }
        };
    }
})();
