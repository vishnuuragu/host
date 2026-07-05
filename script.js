/* ═══════════════════════════════════════════════════════════════
   INTERACTIVE.OS — runtime
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    /* ── Boot sequence ────────────────────────────────────────── */

    const preloader = document.getElementById('preloader');
    const preFill = document.getElementById('pre-fill');
    const prePct = document.getElementById('pre-pct');

    function finishBoot() {
        preloader.classList.add('done');
        document.body.classList.add('loaded');
        try { sessionStorage.setItem('booted', '1'); } catch (e) { /* private mode */ }
    }

    let alreadyBooted = new URLSearchParams(location.search).has('noboot');
    try { alreadyBooted = alreadyBooted || sessionStorage.getItem('booted') === '1'; } catch (e) { /* private mode */ }

    if (!preloader) {
        document.body.classList.add('loaded');
    } else if (reducedMotion || alreadyBooted) {
        preFill.style.width = '100%';
        prePct.textContent = '100%';
        // one frame so the fade transition still applies
        requestAnimationFrame(() => requestAnimationFrame(finishBoot));
    } else {
        const BOOT_MS = 1000;
        const t0 = performance.now();
        (function tick(now) {
            const p = clamp((now - t0) / BOOT_MS, 0, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            preFill.style.width = (eased * 100).toFixed(1) + '%';
            prePct.textContent = Math.round(eased * 100) + '%';
            if (p < 1) requestAnimationFrame(tick);
            else setTimeout(finishBoot, 150);
        })(t0);
    }

    /* ── Starfield + cursor glow (single rAF loop) ────────────── */

    const canvas = document.getElementById('starfield');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const glow = document.getElementById('cursor-glow');

    let stars = [];
    let shot = null;               // active shooting star
    let nextShotAt = 6000;
    let W = 0, H = 0;
    const pointer = { tx: 0, ty: 0, x: 0, y: 0 };   // parallax target/current, -1..1
    const glowPos = { tx: -900, ty: -900, x: -900, y: -900 };
    let rafId = null;

    function sizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildStars();
    }

    function buildStars() {
        const count = Math.min(320, Math.round((W * H) / 8500));
        stars = Array.from({ length: count }, (_, i) => ({
            x: Math.random() * W,
            y: Math.random() * H,
            z: 0.25 + Math.random() * 0.75,          // depth → size, parallax, speed
            r: 0.4 + Math.random() * 1.1,
            a: 0.25 + Math.random() * 0.65,
            phase: Math.random() * Math.PI * 2,
            twinkle: 0.4 + Math.random() * 1.4,
            tint: i % 9 === 0 ? '56,225,255' : i % 13 === 0 ? '167,139,250' : '222,234,255'
        }));
    }

    function drawStars(t) {
        ctx.clearRect(0, 0, W, H);
        const px = pointer.x, py = pointer.y;
        for (const s of stars) {
            const alpha = s.a * (0.62 + 0.38 * Math.sin(t * 0.001 * s.twinkle + s.phase));
            const x = s.x + px * s.z * 16;
            const y = s.y + py * s.z * 10;
            ctx.beginPath();
            ctx.arc(x, y, s.r * s.z + 0.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${s.tint},${alpha.toFixed(3)})`;
            ctx.fill();
        }
        // occasional shooting star
        if (!shot && t > nextShotAt) {
            shot = {
                x: W * (0.1 + Math.random() * 0.6),
                y: H * Math.random() * 0.35,
                vx: 9 + Math.random() * 5,
                vy: 3.5 + Math.random() * 2,
                life: 1
            };
        }
        if (shot) {
            shot.x += shot.vx;
            shot.y += shot.vy;
            shot.life -= 0.022;
            if (shot.life <= 0 || shot.x > W + 120) {
                shot = null;
                nextShotAt = t + 5000 + Math.random() * 8000;
            } else {
                const tail = 14;
                const gx = shot.x - shot.vx * tail;
                const gy = shot.y - shot.vy * tail;
                const grad = ctx.createLinearGradient(shot.x, shot.y, gx, gy);
                grad.addColorStop(0, `rgba(190,240,255,${(0.85 * shot.life).toFixed(3)})`);
                grad.addColorStop(1, 'rgba(190,240,255,0)');
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(shot.x, shot.y);
                ctx.lineTo(gx, gy);
                ctx.stroke();
            }
        }
    }

    function frame(t) {
        // lerped parallax
        pointer.x += (pointer.tx - pointer.x) * 0.045;
        pointer.y += (pointer.ty - pointer.y) * 0.045;
        drawStars(t);
        // lerped cursor glow
        if (glow) {
            glowPos.x += (glowPos.tx - glowPos.x) * 0.12;
            glowPos.y += (glowPos.ty - glowPos.y) * 0.12;
            glow.style.transform = `translate3d(${glowPos.x.toFixed(1)}px, ${glowPos.y.toFixed(1)}px, 0)`;
        }
        rafId = requestAnimationFrame(frame);
    }

    if (ctx) {
        sizeCanvas();
        window.addEventListener('resize', sizeCanvas);

        if (reducedMotion) {
            drawStars(0);          // static sky, no loop
        } else {
            rafId = requestAnimationFrame(frame);
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                } else if (!rafId) {
                    rafId = requestAnimationFrame(frame);
                }
            });
        }
    }

    if (finePointer && !reducedMotion) {
        window.addEventListener('pointermove', (e) => {
            pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
            pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
            glowPos.tx = e.clientX;
            glowPos.ty = e.clientY;
            if (glow && !glow.classList.contains('on')) glow.classList.add('on');
        }, { passive: true });
    }

    /* ── Nav state · back-to-top · protocol line ──────────────── */

    const nav = document.querySelector('.nav');
    const toTop = document.getElementById('to-top');
    const protocol = document.querySelector('.protocol');
    const protocolPath = document.getElementById('protocol-path');
    const protocolNodes = document.querySelectorAll('.protocol-node');
    let scrollScheduled = false;

    function onScroll() {
        scrollScheduled = false;
        const y = window.scrollY;
        if (nav) nav.classList.toggle('scrolled', y > 24);
        if (toTop) {
            if (y > 700) {
                toTop.hidden = false;
                requestAnimationFrame(() => toTop.classList.add('show'));
            } else {
                toTop.classList.remove('show');
            }
        }
        if (protocol && protocolPath) {
            const rect = protocol.getBoundingClientRect();
            const vh = window.innerHeight;
            const p = reducedMotion ? 1 : clamp((vh * 0.85 - rect.top) / (vh * 0.6), 0, 1);
            protocolPath.style.strokeDashoffset = (1 - p).toFixed(4);
            protocolNodes.forEach((node, i) => {
                node.classList.toggle('lit', p > 0.18 + i * 0.34);
            });
        }
    }
    window.addEventListener('scroll', () => {
        if (!scrollScheduled) {
            scrollScheduled = true;
            requestAnimationFrame(onScroll);
        }
    }, { passive: true });
    onScroll();

    if (toTop) {
        toTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
        });
    }

    /* ── Scroll reveals ───────────────────────────────────────── */

    const revealEls = document.querySelectorAll('[data-reveal]');

    // stagger within each grid so rows cascade left → right
    document.querySelectorAll('.card-grid .card').forEach((el, i) => {
        el.style.setProperty('--rd', `${(i % 4) * 70}ms`);
    });
    document.querySelectorAll('.stat-tile').forEach((el, i) => {
        el.style.setProperty('--rd', `${i * 80}ms`);
    });
    document.querySelectorAll('.protocol-step').forEach((el, i) => {
        el.style.setProperty('--rd', `${i * 110}ms`);
    });

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            }
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        revealEls.forEach((el) => revealObserver.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('revealed'));
    }

    /* ── Animated counters ────────────────────────────────────── */

    const counters = document.querySelectorAll('.count');
    const fmt = new Intl.NumberFormat('en-US');

    function runCounter(el) {
        const target = parseInt(el.dataset.count, 10) || 0;
        if (reducedMotion || target === 0) {
            el.textContent = fmt.format(target);
            return;
        }
        const DUR = 1400;
        const t0 = performance.now();
        (function step(now) {
            const p = clamp((now - t0) / DUR, 0, 1);
            const eased = 1 - Math.pow(2, -10 * p);   // easeOutExpo
            el.textContent = fmt.format(Math.round(target * (p === 1 ? 1 : eased)));
            if (p < 1) requestAnimationFrame(step);
        })(t0);
    }

    if ('IntersectionObserver' in window) {
        const countObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    runCounter(entry.target);
                    countObserver.unobserve(entry.target);
                }
            }
        }, { threshold: 0.6 });
        counters.forEach((el) => countObserver.observe(el));
    } else {
        counters.forEach(runCounter);
    }

    /* ── LOC chart draw-in ────────────────────────────────────── */

    const chart = document.getElementById('loc-chart');
    if (chart) {
        if ('IntersectionObserver' in window) {
            const chartObserver = new IntersectionObserver((entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    chart.classList.add('drawn');
                    chartObserver.disconnect();
                }
            }, { threshold: 0.25 });
            chartObserver.observe(chart);
        } else {
            chart.classList.add('drawn');
        }
    }

    /* ── Card tilt + cursor spotlight ─────────────────────────── */

    const cards = document.querySelectorAll('.card');

    if (finePointer && !reducedMotion) {
        cards.forEach((card) => {
            let ticking = false;
            card.addEventListener('pointermove', (e) => {
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(() => {
                    ticking = false;
                    const r = card.getBoundingClientRect();
                    const x = e.clientX - r.left;
                    const y = e.clientY - r.top;
                    const rx = (0.5 - y / r.height) * 6;
                    const ry = (x / r.width - 0.5) * 8;
                    card.style.setProperty('--mx', `${((x / r.width) * 100).toFixed(1)}%`);
                    card.style.setProperty('--my', `${((y / r.height) * 100).toFixed(1)}%`);
                    card.style.transform =
                        `perspective(900px) translateY(-6px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
                });
            });
            card.addEventListener('pointerleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* ── Liquid + magnetic buttons ────────────────────────────── */

    if (finePointer && !reducedMotion) {
        document.querySelectorAll('.btn-liquid').forEach((btn) => {
            btn.addEventListener('pointerenter', (e) => {
                const r = btn.getBoundingClientRect();
                btn.style.setProperty('--bx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
                btn.style.setProperty('--by', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
            });
        });

        document.querySelectorAll('[data-magnetic]').forEach((el) => {
            el.addEventListener('pointermove', (e) => {
                const r = el.getBoundingClientRect();
                const dx = clamp((e.clientX - (r.left + r.width / 2)) * 0.14, -6, 6);
                const dy = clamp((e.clientY - (r.top + r.height / 2)) * 0.2, -5, 5);
                el.style.transform = `translate(${dx.toFixed(1)}px, ${(dy - 2).toFixed(1)}px)`;
            });
            el.addEventListener('pointerleave', () => {
                el.style.transform = '';
            });
        });
    }

    /* ── Module search ────────────────────────────────────────── */

    const searchInput = document.getElementById('app-search');
    const noResults = document.getElementById('no-results');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            let visible = 0;
            cards.forEach((card) => {
                const haystack = (card.textContent + ' ' + (card.dataset.tags || '')).toLowerCase();
                const match = haystack.includes(query);
                card.hidden = !match;
                // force-reveal matches that were still waiting below the fold
                if (match) {
                    card.classList.add('revealed');
                    visible++;
                }
            });
            if (noResults) noResults.hidden = visible > 0;
        });

        document.addEventListener('keydown', (e) => {
            const tag = document.activeElement && document.activeElement.tagName;
            const typing = tag === 'INPUT' || tag === 'TEXTAREA';
            if (e.key === '/' && !typing) {
                e.preventDefault();
                searchInput.focus();
            } else if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.blur();
            }
        });
    }

    /* ── Footer year ──────────────────────────────────────────── */

    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
});
