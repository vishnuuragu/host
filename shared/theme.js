/* ═══════════════════════════════════════════════════════════════
   INTERACTIVE.OS — shared module runtime
   Injects the ambient background (aurora, starfield, noise, cursor
   glow), drives the floating nav, scroll reveals and entrance
   motion on every module page.
   ═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    /* ── Ambient layers ───────────────────────────────────────── */

    const ambient = document.createElement('div');
    ambient.setAttribute('aria-hidden', 'true');
    ambient.innerHTML =
        '<div class="aurora">' +
            '<div class="aurora-blob aurora-a"></div>' +
            '<div class="aurora-blob aurora-b"></div>' +
            '<div class="aurora-blob aurora-c"></div>' +
        '</div>' +
        '<div class="grid-overlay"></div>' +
        '<canvas id="starfield"></canvas>' +
        '<div class="noise"></div>' +
        '<div id="cursor-glow"></div>';
    while (ambient.firstChild) {
        document.body.insertBefore(ambient.firstChild, document.body.firstChild);
    }

    /* ── Starfield + cursor glow (single rAF loop) ────────────── */

    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    const glow = document.getElementById('cursor-glow');

    let stars = [];
    let shot = null;
    let nextShotAt = 7000;
    let W = 0, H = 0;
    const pointer = { tx: 0, ty: 0, x: 0, y: 0 };
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
        const count = Math.min(260, Math.round((W * H) / 10000));
        stars = Array.from({ length: count }, (_, i) => ({
            x: Math.random() * W,
            y: Math.random() * H,
            z: 0.25 + Math.random() * 0.75,
            r: 0.4 + Math.random() * 1.1,
            a: 0.22 + Math.random() * 0.6,
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
            ctx.beginPath();
            ctx.arc(s.x + px * s.z * 16, s.y + py * s.z * 10, s.r * s.z + 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + s.tint + ',' + alpha.toFixed(3) + ')';
            ctx.fill();
        }
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
                nextShotAt = t + 6000 + Math.random() * 9000;
            } else {
                const gx = shot.x - shot.vx * 14;
                const gy = shot.y - shot.vy * 14;
                const grad = ctx.createLinearGradient(shot.x, shot.y, gx, gy);
                grad.addColorStop(0, 'rgba(190,240,255,' + (0.85 * shot.life).toFixed(3) + ')');
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
        pointer.x += (pointer.tx - pointer.x) * 0.045;
        pointer.y += (pointer.ty - pointer.y) * 0.045;
        drawStars(t);
        glowPos.x += (glowPos.tx - glowPos.x) * 0.12;
        glowPos.y += (glowPos.ty - glowPos.y) * 0.12;
        glow.style.transform = 'translate3d(' + glowPos.x.toFixed(1) + 'px, ' + glowPos.y.toFixed(1) + 'px, 0)';
        rafId = requestAnimationFrame(frame);
    }

    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);

    if (reducedMotion) {
        drawStars(0);
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

    if (finePointer && !reducedMotion) {
        window.addEventListener('pointermove', (e) => {
            pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
            pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
            glowPos.tx = e.clientX;
            glowPos.ty = e.clientY;
            if (!glow.classList.contains('on')) glow.classList.add('on');
        }, { passive: true });
    }

    /* ── Nav scrolled state ───────────────────────────────────── */

    const nav = document.querySelector('.app-nav');
    let scrollScheduled = false;
    window.addEventListener('scroll', () => {
        if (scrollScheduled) return;
        scrollScheduled = true;
        requestAnimationFrame(() => {
            scrollScheduled = false;
            if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
        });
    }, { passive: true });

    /* ── Entrance + scroll reveals ────────────────────────────── */

    function boot() {
        requestAnimationFrame(() => requestAnimationFrame(() => {
            document.body.classList.add('loaded');
        }));

        const revealEls = document.querySelectorAll('[data-reveal]');
        // cascade panels that share a row
        document.querySelectorAll('[data-reveal]').forEach((el, i) => {
            if (!el.style.getPropertyValue('--rd')) {
                el.style.setProperty('--rd', ((i % 3) * 80) + 'ms');
            }
        });

        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        obs.unobserve(entry.target);
                    }
                }
            }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
            revealEls.forEach((el) => obs.observe(el));
        } else {
            revealEls.forEach((el) => el.classList.add('revealed'));
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    /* ── Range slider fill sync ───────────────────────────────── */

    document.addEventListener('input', (e) => {
        if (e.target.matches && e.target.matches('input[type="range"]')) {
            const min = parseFloat(e.target.min) || 0;
            const max = parseFloat(e.target.max) || 100;
            const p = ((e.target.value - min) / (max - min)) * 100;
            e.target.style.setProperty('--fill', p.toFixed(1) + '%');
        }
    });
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('input[type="range"]').forEach((el) => {
            const min = parseFloat(el.min) || 0;
            const max = parseFloat(el.max) || 100;
            const p = ((el.value - min) / (max - min)) * 100;
            el.style.setProperty('--fill', p.toFixed(1) + '%');
        });
    });
})();
