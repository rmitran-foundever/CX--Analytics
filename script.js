// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Pause marquee on hover
const track = document.querySelector('.rolling-bar-track');
if (track) {
  track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
}

// ===== Solutions Tab Navigation =====
(function() {
  const items = document.querySelectorAll('.sol-bar-item');
  const cards = document.querySelectorAll('.sol-card');
  if (!items.length) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      const idx = item.dataset.index;
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      cards.forEach(c => c.classList.remove('visible'));
      const target = document.querySelector('.sol-card[data-card="' + idx + '"]');
      if (target) {
        target.style.animation = 'none';
        target.offsetHeight;
        target.style.animation = '';
        target.classList.add('visible');
      }
    });
  });
})();

// ===== Count-Up Animation (integers) =====
(function() {
  const counters = document.querySelectorAll('.count-up');
  if (!counters.length) return;

  const duration = 1800;

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

// ===== 9M Decimal Counter =====
(function() {
  const el = document.getElementById('hstat-counter');
  if (!el) return;
  let animated = false;
  const duration = 1800;
  const target = 9.0;

  function animate() {
    if (animated) return;
    animated = true;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = (ease * target).toFixed(1);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) animate(); });
  }, { threshold: 0.3 });

  observer.observe(el);
})();

// ===== "Is this workshop for you?" Interactive Diagnostic =====
(function() {
  const QUIZ = {
    cxops: {
      questions: [
        'Can you see your repeat-contact rate segmented by reason code within the last 30 days?',
        'Do you know which customer journeys generate the highest effort scores \u2014 by journey, not just by channel?',
        'When an issue resolves, can you trace whether the customer contacted you again within a week on the same topic?'
      ],
      tiers: {
        low: {
          label: 'Built for you',
          headline: 'This workshop was built for you.',
          body: 'You likely have the data \u2014 what\u2019s missing is the translation layer from signal to intervention. You\u2019d leave the 45 minutes with two or three specific things to investigate in your own estate.'
        },
        mid: {
          label: 'Worth 45 minutes',
          headline: 'Worth the 45 minutes.',
          body: 'You\u2019re past the data-fragmentation stage, but sharpening the translation from insight to action is where most ops leaders plateau. The workshop focuses on closing that gap.'
        },
        high: {
          label: 'Benchmarking conversation',
          headline: 'You\u2019re ahead of most.',
          body: 'The workshop would be more benchmarking than diagnosing. Still useful if you\u2019re thinking about scale, acquisition integration, or a new market.'
        }
      }
    },
    risk: {
      questions: [
        'Can you produce evidence that vulnerable customers received equivalent outcomes to non-vulnerable ones in the last quarter?',
        'Does your CX data feed vulnerability flags in a way that\u2019s auditable to an FCA standard?',
        'Can you show how vulnerability identification influenced handler behaviour in the last 90 days?'
      ],
      tiers: {
        low: {
          label: 'Exposure worth closing',
          headline: 'You have Consumer Duty exposure.',
          body: 'The workshop helps you move from defensive reporting to evidential data \u2014 the kind you\u2019d actually want on hand if the FCA came asking. Leaves you with a 90-day remediation plan.'
        },
        mid: {
          label: 'Closing the gap',
          headline: 'You have the basics. The gap is operational proof.',
          body: 'Reporting exists; what\u2019s missing is the link between what you report and what your handlers actually do. The workshop focuses on closing the distance between compliance evidence and operational reality.'
        },
        high: {
          label: 'Commercial advantage',
          headline: 'You\u2019re above industry standard.',
          body: 'The conversation becomes less about exposure and more about turning compliance rigour into commercial advantage \u2014 lower complaints, better retention, defensible positioning on vulnerable outcomes.'
        }
      }
    },
    cfo: {
      questions: [
        'Can you attribute CX investment to revenue outcomes (retention, cross-sell, upsell) at a cohort level?',
        'Do you have a running dashboard of \u201crevenue at risk\u201d based on CX signals?',
        'When a CX change is proposed, can you model the P&L impact before approving it?'
      ],
      tiers: {
        low: {
          label: 'Math before faith',
          headline: 'Your CX spend is probably approved on faith, not math.',
          body: 'The workshop builds the business case engine \u2014 cohort-level attribution, revenue-at-risk dashboarding, and a pre-approval P&L model. You\u2019d leave with a one-page framework your team could start building against.'
        },
        mid: {
          label: 'Scaling the wiring',
          headline: 'You\u2019ve got some of the wiring.',
          body: 'The workshop focuses on scaling the attribution layer from pilot to portfolio \u2014 and on making the business case fast enough that it doesn\u2019t become the bottleneck on transformation speed.'
        },
        high: {
          label: 'Peer-level conversation',
          headline: 'You\u2019re in a small minority.',
          body: 'The workshop becomes a peer-level conversation on scaling analytical rigour without slowing the business \u2014 and on how finance and ops teams at your maturity divide the work.'
        }
      }
    }
  };

  function tierFromScore(score) {
    if (score >= 5) return 'high';
    if (score >= 3) return 'mid';
    return 'low';
  }

  document.querySelectorAll('.quiz-card').forEach(card => {
    const role = card.dataset.role;
    const cfg = QUIZ[role];
    if (!cfg) return;

    // Per-card state
    const state = { index: 0, answers: [] };

    const els = {
      progress: card.querySelector('.quiz-progress'),
      progressFill: card.querySelector('.quiz-progress-fill'),
      qIndex: card.querySelector('.quiz-q-index'),
      question: card.querySelector('.quiz-question'),
      answers: card.querySelectorAll('.quiz-answer'),
      scoreValue: card.querySelector('.quiz-score-value'),
      tierLabel: card.querySelector('.quiz-tier-label'),
      tierHeadline: card.querySelector('.quiz-tier-headline'),
      tierBody: card.querySelector('.quiz-tier-body'),
      cta: card.querySelector('.quiz-cta')
    };

    function setProgress(pct) {
      els.progressFill.style.width = pct + '%';
      els.progress.setAttribute('aria-valuenow', String(pct));
    }

    function renderQuestion() {
      els.qIndex.textContent = String(state.index + 1);
      els.question.textContent = cfg.questions[state.index];
      // Progress reflects *completed* questions, so 0%, 33%, 66% before reveal
      setProgress(Math.round((state.index / cfg.questions.length) * 100));
    }

    function reset() {
      state.index = 0;
      state.answers = [];
      setProgress(0);
      renderQuestion();
    }

    function start() {
      reset();
      card.dataset.state = 'test';
      // Focus first answer for keyboard users
      const first = card.querySelector('.quiz-answer');
      if (first) first.focus();
    }

    function close() {
      card.dataset.state = 'teaser';
      reset();
    }

    function showResult() {
      const score = state.answers.reduce((a, b) => a + b, 0);
      const tier = tierFromScore(score);
      const t = cfg.tiers[tier];
      els.scoreValue.textContent = String(score);
      els.tierLabel.textContent = t.label;
      els.tierHeadline.textContent = t.headline;
      els.tierBody.textContent = t.body;
      els.cta.setAttribute('href', '?role=' + role + '&tier=' + tier + '#cta');
      setProgress(100);
      card.dataset.state = 'result';
      const retake = card.querySelector('.quiz-btn-retake');
      if (retake) retake.focus();
    }

    function answer(score) {
      state.answers.push(score);
      if (state.index < cfg.questions.length - 1) {
        state.index += 1;
        renderQuestion();
        const first = card.querySelector('.quiz-answer');
        if (first) first.focus();
      } else {
        showResult();
      }
    }

    // Event delegation on the card
    card.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'start') start();
      else if (action === 'close') close();
      else if (action === 'retake') start();
      else if (action === 'answer') answer(parseInt(btn.dataset.score, 10));
    });

    // Initialize first question text (safe default even before user starts)
    renderQuestion();
  });
})();
