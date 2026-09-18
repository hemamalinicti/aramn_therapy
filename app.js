/**
 * Aran Therapy (@aramntherapy) - Multi-Page Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initActiveNavLink();
  initBookingModal();
  initBookingPageWizard();
  initSelfCareQuiz();
  initGalleryGrid();
  initServiceModals();
  initFaqAccordion();
  initContactForm();
  initHeroCircleMovement();
  initScrollAnimations();
  initReviewsCarousel();
});

/* ----------------------------------------------------
   Hero Circle 2D Collision Physics:
   Inner Circle bounces randomly when hitting Outer Circle curve
---------------------------------------------------- */
function initHeroCircleMovement() {
  const outer = document.getElementById('outerCircle');
  const inner = document.getElementById('innerCircle');

  if (!outer || !inner) return;

  // Velocity vector
  let speed = 1.5;
  let angle = Math.random() * Math.PI * 2;
  let vx = Math.cos(angle) * speed;
  let vy = Math.sin(angle) * speed;

  // Position relative to outer center
  let posX = 0;
  let posY = 0;

  function updatePhysics() {
    const outerRect = outer.getBoundingClientRect();
    const innerRect = inner.getBoundingClientRect();

    if (outerRect.width === 0 || innerRect.width === 0) {
      requestAnimationFrame(updatePhysics);
      return;
    }

    const outerR = outerRect.width / 2;
    const innerR = innerRect.width / 2;
    const maxDist = Math.max(10, outerR - innerR - 6); // Margin for border stroke

    // Move
    posX += vx;
    posY += vy;

    // Distance from center
    const dist = Math.sqrt(posX * posX + posY * posY);

    // Collision detection with outer circle curve
    if (dist >= maxDist) {
      // Normal vector pointing outward from center
      const nx = posX / dist;
      const ny = posY / dist;

      // Clamp position exactly onto the max boundary curve
      posX = nx * maxDist;
      posY = ny * maxDist;

      // Reflect velocity across inward normal (-nx, -ny)
      const inwardNx = -nx;
      const inwardNy = -ny;
      const dot = vx * inwardNx + vy * inwardNy;

      let rx = vx - 2 * dot * inwardNx;
      let ry = vy - 2 * dot * inwardNy;

      // Add a random angle deviation (+/- 30 degrees) for random bouncy motion
      const randomOffset = (Math.random() * 0.9 - 0.45); // ~ +/- 25 deg
      const currentAngle = Math.atan2(ry, rx) + randomOffset;

      // Maintain steady movement speed
      const curSpeed = 1.4 + Math.random() * 0.4;
      vx = Math.cos(currentAngle) * curSpeed;
      vy = Math.sin(currentAngle) * curSpeed;

      // Visual flash on hitting the curve
      inner.style.boxShadow = '0 0 25px rgba(245, 229, 155, 0.9)';
      setTimeout(() => {
        inner.style.boxShadow = '0 15px 35px rgba(0,0,0,0.5)';
      }, 150);
    }

    // Apply transform relative to center
    inner.style.transform = `translate3d(${posX.toFixed(2)}px, ${posY.toFixed(2)}px, 0)`;

    requestAnimationFrame(updatePhysics);
  }

  requestAnimationFrame(updatePhysics);
}

/* ----------------------------------------------------
   1. Navigation & Active State
---------------------------------------------------- */
function initNavigation() {
  const header = document.querySelector('.navbar-glass');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('navbar-scrolled');
    } else {
      header?.classList.remove('navbar-scrolled');
    }
  });

  mobileBtn?.addEventListener('click', () => {
    const isOpen = mobileNav?.classList.contains('hidden');
    if (isOpen) {
      mobileNav?.classList.remove('hidden');
      mobileNav?.classList.add('flex');
    } else {
      mobileNav?.classList.add('hidden');
      mobileNav?.classList.remove('flex');
    }
  });

  document.querySelectorAll('#mobileNav a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav?.classList.add('hidden');
      mobileNav?.classList.remove('flex');
    });
  });
}

function initActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('text-gold', 'font-bold');
      link.classList.remove('text-slate-300');
    } else {
      link.classList.remove('text-gold', 'font-bold');
    }
  });
}

/* ----------------------------------------------------
   2. Booking System
---------------------------------------------------- */
let currentBookingStep = 1;
const bookingData = {
  service: 'Deep Tissue Therapy',
  format: 'In-Studio Session',
  practitioner: 'Certified Body Therapist',
  date: '',
  time: '10:00 AM',
  name: '',
  email: '',
  phone: '',
  notes: ''
};

function initBookingModal() {
  const modal = document.getElementById('bookingModal');
  const openBtns = document.querySelectorAll('.open-booking-modal');
  const closeBtn = document.getElementById('closeBookingModal');
  const nextBtn = document.getElementById('bookingNextBtn');
  const prevBtn = document.getElementById('bookingPrevBtn');

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const servicePreset = btn.getAttribute('data-service');
      if (servicePreset) bookingData.service = servicePreset;
      openModal(modal);
      updateBookingWizardStep(1, 'modal');
    });
  });

  closeBtn?.addEventListener('click', () => closeModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });

  setupBookingInputs('modal');

  nextBtn?.addEventListener('click', () => handleBookingNext('modal'));
  prevBtn?.addEventListener('click', () => handleBookingPrev('modal'));
}

function initBookingPageWizard() {
  const pageContainer = document.getElementById('bookingPageContainer');
  if (!pageContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  if (serviceParam) bookingData.service = serviceParam;

  setupBookingInputs('page');

  const nextBtn = document.getElementById('pageBookingNextBtn');
  const prevBtn = document.getElementById('pageBookingPrevBtn');

  nextBtn?.addEventListener('click', () => handleBookingNext('page'));
  prevBtn?.addEventListener('click', () => handleBookingPrev('page'));

  updateBookingWizardStep(1, 'page');
}

function setupBookingInputs(context = 'modal') {
  const prefix = context === 'page' ? 'page' : '';

  const serviceChoices = document.querySelectorAll(`.${prefix ? prefix + '-' : ''}service-choice`);
  serviceChoices.forEach(card => {
    card.addEventListener('click', () => {
      serviceChoices.forEach(c => c.classList.remove('border-gold', 'bg-sand-card'));
      card.classList.add('border-gold', 'bg-sand-card');
      bookingData.service = card.getAttribute('data-value') || bookingData.service;
    });
  });

  const formatChoices = document.querySelectorAll(`.${prefix ? prefix + '-' : ''}format-choice`);
  formatChoices.forEach(btn => {
    btn.addEventListener('click', () => {
      formatChoices.forEach(b => b.classList.remove('bg-emerald-dark', 'text-gold'));
      btn.classList.add('bg-emerald-dark', 'text-gold');
      bookingData.format = btn.innerText;
    });
  });

  const timeSlots = document.querySelectorAll(`.${prefix ? prefix + '-' : ''}time-slot-btn`);
  timeSlots.forEach(btn => {
    btn.addEventListener('click', () => {
      timeSlots.forEach(b => b.classList.remove('bg-emerald-dark', 'text-gold'));
      btn.classList.add('bg-emerald-dark', 'text-gold');
      bookingData.time = btn.innerText;
    });
  });

  const dateInput = document.getElementById(`${prefix ? prefix : 'booking'}Date`);
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
    bookingData.date = dateInput.value;
    dateInput.addEventListener('change', (e) => {
      bookingData.date = e.target.value;
    });
  }
}

function handleBookingNext(context = 'modal') {
  const prefix = context === 'page' ? 'page' : '';
  
  if (currentBookingStep === 1) {
    updateBookingWizardStep(2, context);
  } else if (currentBookingStep === 2) {
    updateBookingWizardStep(3, context);
  } else if (currentBookingStep === 3) {
    const nameEl = document.getElementById(`${prefix ? prefix : 'booking'}Name`);
    const emailEl = document.getElementById(`${prefix ? prefix : 'booking'}Email`);
    const phoneEl = document.getElementById(`${prefix ? prefix : 'booking'}Phone`);
    const notesEl = document.getElementById(`${prefix ? prefix : 'booking'}Notes`);

    const name = nameEl?.value.trim();
    const email = emailEl?.value.trim();

    if (!name || !email) {
      showToast('Please enter your name and email address.', 'error');
      return;
    }

    bookingData.name = name;
    bookingData.email = email;
    bookingData.phone = phoneEl?.value.trim() || 'N/A';
    bookingData.notes = notesEl?.value.trim() || 'None';

    const sumService = document.getElementById(`${prefix ? prefix : 'summary'}Service`);
    const sumDateTime = document.getElementById(`${prefix ? prefix : 'summary'}DateTime`);
    const sumClient = document.getElementById(`${prefix ? prefix : 'summary'}Client`);

    if (sumService) sumService.textContent = `${bookingData.service} (${bookingData.format})`;
    if (sumDateTime) sumDateTime.textContent = `${bookingData.date} at ${bookingData.time}`;
    if (sumClient) sumClient.textContent = `${bookingData.name} (${bookingData.email})`;

    updateBookingWizardStep(4, context);
    showToast('Therapy Session Booked! Confirmation sent to your email.', 'success');
  } else if (currentBookingStep === 4) {
    if (context === 'modal') {
      const modal = document.getElementById('bookingModal');
      closeModal(modal);
    } else {
      window.location.href = 'index.html';
    }
    currentBookingStep = 1;
  }
}

function handleBookingPrev(context = 'modal') {
  if (currentBookingStep > 1 && currentBookingStep < 4) {
    updateBookingWizardStep(currentBookingStep - 1, context);
  }
}

function updateBookingWizardStep(step, context = 'modal') {
  currentBookingStep = step;
  const prefix = context === 'page' ? 'page' : 'booking';

  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById(`${prefix}Step${i}`);
    if (stepEl) {
      if (i === step) {
        stepEl.classList.remove('hidden');
      } else {
        stepEl.classList.add('hidden');
      }
    }

    const dot = document.getElementById(`${context === 'page' ? 'pDot' : 'stepDot'}${i}`);
    if (dot) {
      if (i <= step) {
        dot.classList.add('bg-emerald-dark', 'text-gold');
        dot.classList.remove('bg-sand-card', 'text-slate-muted');
      } else {
        dot.classList.remove('bg-emerald-dark', 'text-gold');
        dot.classList.add('bg-sand-card', 'text-slate-muted');
      }
    }
  }

  const prevBtn = document.getElementById(`${context === 'page' ? 'pageBookingPrevBtn' : 'bookingPrevBtn'}`);
  const nextBtn = document.getElementById(`${context === 'page' ? 'pageBookingNextBtn' : 'bookingNextBtn'}`);

  if (prevBtn) {
    if (step === 1 || step === 4) {
      prevBtn.classList.add('hidden');
    } else {
      prevBtn.classList.remove('hidden');
    }
  }

  if (nextBtn) {
    if (step === 3) {
      nextBtn.innerText = 'Confirm Booking';
    } else if (step === 4) {
      nextBtn.innerText = 'Return Home';
    } else {
      nextBtn.innerText = 'Continue';
    }
  }
}

/* ----------------------------------------------------
   3. Self-Care Assessment Quiz
---------------------------------------------------- */
const quizAnswers = { q1: '', q2: '', q3: '' };

function initSelfCareQuiz() {
  const options = document.querySelectorAll('.quiz-option-card');
  const submitBtn = document.getElementById('quizSubmitBtn');
  const resetBtn = document.getElementById('quizResetBtn');
  const resultCard = document.getElementById('quizResultCard');

  if (!submitBtn) return;

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const q = opt.getAttribute('data-question');
      const val = opt.getAttribute('data-value');
      
      document.querySelectorAll(`.quiz-option-card[data-question="${q}"]`).forEach(el => {
        el.classList.remove('selected');
        const badge = el.querySelector('.quiz-check-indicator');
        if (badge) badge.remove();
      });

      opt.classList.add('selected');
      
      // Inject animated gold check badge
      const checkBadge = document.createElement('div');
      checkBadge.className = 'quiz-check-indicator absolute top-3 right-3 w-6 h-6 rounded-full bg-gold text-emerald-dark flex items-center justify-center text-xs shadow-lg animate-bounce-in';
      checkBadge.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 stroke-[3]"></i>';
      opt.appendChild(checkBadge);
      if (window.lucide) window.lucide.createIcons();

      quizAnswers[q] = val;
    });
  });

  submitBtn.addEventListener('click', () => {
    if (!quizAnswers.q1 || !quizAnswers.q2 || !quizAnswers.q3) {
      showToast('Please select choices for all 3 questions.', 'info');
      return;
    }

    let recTitle = "Deep Tissue Body Therapy";
    let recDesc = "Recommended for relieving stubborn back tension, posture fatigue, and severe muscle knots.";
    let serviceCode = "Deep Tissue Therapy";

    if (quizAnswers.q1 === 'burnout' || quizAnswers.q2 === 'growth') {
      recTitle = "Swedish Oil Full Body Massage";
      recDesc = "A soothing, continuous full body oil massage designed to ease stress and quiet nervous exhaustion.";
      serviceCode = "Swedish Massage";
    } else if (quizAnswers.q2 === 'connection') {
      recTitle = "Somatic Hot Stone Recovery";
      recDesc = "Combines thermal hot stones and deep stretch therapy to revive overworked muscles for gents.";
      serviceCode = "Somatic Recovery";
    }

    const titleEl = document.getElementById('recTitle');
    const descEl = document.getElementById('recDesc');
    const bookBtn = document.getElementById('recBookBtn');

    if (titleEl) titleEl.textContent = recTitle;
    if (descEl) descEl.textContent = recDesc;
    if (bookBtn) bookBtn.setAttribute('data-service', serviceCode);

    if (resultCard) {
      resultCard.classList.remove('hidden');
      resultCard.classList.remove('animate-quiz-result');
      // Trigger reflow for animation restart
      void resultCard.offsetWidth;
      resultCard.classList.add('animate-quiz-result');
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    showToast('Your recommended therapy choice is ready!', 'success');
  });

  resetBtn?.addEventListener('click', () => {
    quizAnswers.q1 = ''; quizAnswers.q2 = ''; quizAnswers.q3 = '';
    document.querySelectorAll('.quiz-option-card').forEach(el => {
      el.classList.remove('selected');
      const badge = el.querySelector('.quiz-check-indicator');
      if (badge) badge.remove();
    });
    resultCard?.classList.add('hidden');
  });
}

/* ----------------------------------------------------
   4. Gallery Grid & Lightbox Modal Viewer
---------------------------------------------------- */
const galleryPhotos = [
  {
    id: 1,
    title: "Dumbbell Shoulder & Form Guidance",
    category: "fitness",
    categoryLabel: "Fitness Recovery",
    image: "assets/images/gallery_1.jpg",
    desc: "Targeted shoulder joint stabilization and posture alignment in our athletic recovery facility."
  },
  {
    id: 2,
    title: "Upper Back & Trapezius Deep Pressure",
    category: "therapy",
    categoryLabel: "Body Therapy",
    image: "assets/images/gallery_2.jpg",
    desc: "Certified practitioner applying focused deep pressure manipulation to relieve stubborn upper back muscle knots."
  },
  {
    id: 3,
    title: "Bosu Balance & Knee Stability Workout",
    category: "fitness",
    categoryLabel: "Fitness Recovery",
    image: "assets/images/gallery_3.jpg",
    desc: "Assisted lower body proprioception and knee joint stabilization exercise for gents."
  },
  {
    id: 4,
    title: "Targeted Forearm Ultrasound Therapy",
    category: "rehab",
    categoryLabel: "Posture & Rehab",
    image: "assets/images/gallery_4.jpg",
    desc: "Deep thermal ultrasound therapy for tendon strain and joint stiffness relief."
  },
  {
    id: 5,
    title: "Resistance Band Shoulder Mobility",
    category: "rehab",
    categoryLabel: "Posture & Rehab",
    image: "assets/images/gallery_5.jpg",
    desc: "Postural correction and rotator cuff mobility exercise guided by certified therapist."
  },
  {
    id: 6,
    title: "Calf & Lower Leg Muscular Compression",
    category: "therapy",
    categoryLabel: "Body Therapy",
    image: "assets/images/gallery_6.jpg",
    desc: "Therapeutic calf muscle pressure release to soothe lower leg tightness and endurance strain."
  },
  {
    id: 7,
    title: "Leg Press Athletic Resistance Training",
    category: "fitness",
    categoryLabel: "Fitness Recovery",
    image: "assets/images/gallery_7.jpg",
    desc: "Controlled leg extension conditioning for athletic gents building quadricep strength."
  },
  {
    id: 8,
    title: "Core Plank & Lumbar Spine Assessment",
    category: "rehab",
    categoryLabel: "Posture & Rehab",
    image: "assets/images/gallery_8.jpg",
    desc: "Postural core evaluation to identify lower back strain and pelvic alignment."
  },
  {
    id: 9,
    title: "Goniometric Elbow Range of Motion Test",
    category: "rehab",
    categoryLabel: "Posture & Rehab",
    image: "assets/images/gallery_9.jpg",
    desc: "Precise joint angle measurement for arm mobility and ligament recovery."
  },
  {
    id: 10,
    title: "Private Consultation & Therapy Suite",
    category: "therapy",
    categoryLabel: "Body Therapy",
    image: "assets/images/gallery_10.jpg",
    desc: "Confidential 1-on-1 consultation in our private luxury gents treatment suite."
  }
];

function initGalleryGrid() {
  const container = document.getElementById('galleryGridContainer');
  const modal = document.getElementById('galleryModal');
  const closeBtn = document.getElementById('closeGalleryModal');
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');

  if (!container) return;

  function renderGrid(filter = 'all') {
    container.innerHTML = '';
    const filtered = filter === 'all' 
      ? galleryPhotos 
      : galleryPhotos.filter(p => p.category === filter);

    filtered.forEach(photo => {
      const card = document.createElement('div');
      card.className = 'group cursor-pointer relative rounded-2xl sm:rounded-3xl overflow-hidden border border-sand-border shadow-sm hover:shadow-xl transition-all duration-300 aspect-[4/3] bg-emerald-dark';
      card.innerHTML = `
        <img src="${photo.image}" alt="${photo.title}" class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
        <div class="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-emerald-dark/95 backdrop-blur-md text-gold text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-gold/40 shadow-sm">
          ${photo.categoryLabel}
        </div>
      `;
      card.addEventListener('click', () => openGalleryModal(photo));
      container.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-emerald-dark', 'text-gold');
        b.classList.add('bg-sand-card', 'text-slate-text');
      });
      btn.classList.remove('bg-sand-card', 'text-slate-text');
      btn.classList.add('bg-emerald-dark', 'text-gold');
      renderGrid(btn.getAttribute('data-filter') || 'all');
    });
  });

  closeBtn?.addEventListener('click', () => closeModal(modal));
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });

  function openGalleryModal(photo) {
    const modalImg = document.getElementById('galleryModalImg');
    const modalTag = document.getElementById('galleryModalTag');
    const modalTitle = document.getElementById('galleryModalTitle');
    const modalDesc = document.getElementById('galleryModalDesc');

    if (modalImg) modalImg.src = photo.image;
    if (modalTag) modalTag.textContent = photo.categoryLabel;
    if (modalTitle) modalTitle.textContent = photo.title;
    if (modalDesc) modalDesc.textContent = photo.desc;

    openModal(modal);
  }

  renderGrid('all');
}

/* ----------------------------------------------------
   5. Service Detail Modals
---------------------------------------------------- */
const serviceDetails = {
  deep_tissue: {
    title: "Deep Tissue Body Therapy",
    subtitle: "60 / 90 Minutes • Muscle Knots & Back Strain Relief",
    desc: "Targeted firm pressure manipulation focused on realigning deeper muscle and connective tissue layers. Perfect for gents with chronic back stiffness, shoulder tightness, and posture fatigue.",
    features: [
      "Relieves stubborn back & shoulder muscle knots",
      "Enhances range of posture motion & spinal alignment",
      "Organic muscle recovery essential oil application",
      "Private luxury gents therapy suite"
    ]
  },
  swedish: {
    title: "Swedish Oil Full Body Massage",
    subtitle: "60 / 90 Minutes • Full Body Relaxation",
    desc: "Continuous full body Swedish oil massage techniques designed to melt daily work stress, improve systemic blood circulation, and soothe physical fatigue.",
    features: [
      "Full body Swedish gliding strokes",
      "Warm organic aromatherapy essential oils",
      "Quiets nervous system & lowers cortisol",
      "Complimentary herbal tea & hot towel refresh"
    ]
  },
  somatic: {
    title: "Somatic Hot Stone Muscle Recovery",
    subtitle: "90 Minutes • Thermal Stone & Deep Stretching",
    desc: "Combines heated smooth volcanic basalt stones and assisted somatic stretching to penetrate deep into tight muscle tissue and restore athletic endurance.",
    features: [
      "Thermal basalt stone heat penetration",
      "Assisted somatic joint mobility & stretching",
      "Accelerates post-workout muscular recovery",
      "Deep relief for thighs, back & shoulders"
    ]
  },
  head_neck: {
    title: "Head, Neck & Temple Tension Relief",
    subtitle: "45 / 60 Minutes • Focused Strain Relief",
    desc: "Targeted acupressure massage designed specifically for gents suffering from desk fatigue, screen-induced headaches, neck stiffness, and upper back tightness.",
    features: [
      "Suboccipital & scalp reflex point therapy",
      "Relieves desk posture & neck strain",
      "Peppermint & lavender oil infused pressure",
      "Quick mental refresh & posture alignment"
    ]
  },
  aromatherapy: {
    title: "Aromatherapy Physical Restorative",
    subtitle: "60 / 90 Minutes • Vitality & Nerve Care",
    desc: "Custom-blended botanical oil massage combining therapeutic cedarwood, eucalyptus, and sandalwood oils to replenish physical stamina, boost immunity, and soothe deep nerve exhaustion.",
    features: [
      "Custom essential oil infusion tailored to fatigue",
      "Full body stamina & nerve restoration",
      "Relieves physical & mental burn-out",
      "Includes herbal tea & hot towel session"
    ]
  },
  express_reflexology: {
    title: "Executive Male Express Reflexology",
    subtitle: "45 Minutes • Express Focus",
    desc: "Designed for busy gentlemen needing quick, high-impact relief. Combines foot reflexology, lower leg tension massage, and upper back pressure points to recharge your body.",
    features: [
      "Foot reflexology & calf muscle release",
      "High-impact 45-minute express turnaround",
      "Restores energy levels for busy gents",
      "Relieves leg fatigue & foot ache"
    ]
  }
};

function initServiceModals() {
  const modal = document.getElementById('serviceModal');
  const closeBtn = document.getElementById('closeServiceModal');
  const triggerBtns = document.querySelectorAll('.open-service-detail');

  if (!modal) return;

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const key = btn.getAttribute('data-key');
      const data = serviceDetails[key];
      if (!data) return;

      document.getElementById('serviceModalTitle').textContent = data.title;
      document.getElementById('serviceModalSub').textContent = data.subtitle;
      document.getElementById('serviceModalDesc').textContent = data.desc;

      const listContainer = document.getElementById('serviceModalFeatures');
      if (listContainer) {
        listContainer.innerHTML = data.features.map(f => `
          <li class="flex items-center gap-2.5 text-sm text-slate-muted">
            <i data-lucide="check-circle-2" class="w-4 h-4 text-gold flex-shrink-0"></i>
            <span>${f}</span>
          </li>
        `).join('');
      }

      document.getElementById('serviceModalBookBtn')?.setAttribute('data-service', data.title);

      openModal(modal);
      if (window.lucide) window.lucide.createIcons();
    });
  });

  closeBtn?.addEventListener('click', () => closeModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
}

/* ----------------------------------------------------
   6. FAQ Accordion
---------------------------------------------------- */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const header = item.querySelector('.faq-header');
    header?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      items.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}

/* ----------------------------------------------------
   7. Contact Form Handling
---------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();
    const message = document.getElementById('contactMessage')?.value.trim();

    if (!name || !email || !message) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    form.reset();
    showToast('Thank you! Your message has been sent to Aran Therapy Center.', 'success');
  });
}

/* ----------------------------------------------------
   Helper UI Functions
---------------------------------------------------- */
function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('active');
  document.body.style.overflow = '';
}

function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  let iconName = 'info';

  if (type === 'success') {
    iconName = 'check-circle';
  } else if (type === 'error') {
    iconName = 'alert-circle';
  }

  toast.className = `toast text-gold flex items-center gap-3 px-4 py-3 rounded-xl border border-gold bg-emerald-dark shadow-xl`;
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-5 h-5 flex-shrink-0 text-gold"></i>
    <span class="text-sm font-medium">${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
        entry.target.classList.remove('opacity-0', 'translate-y-8');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-8');
    observer.observe(el);
  });
}

/* ----------------------------------------------------
   Auto-Gliding Client Reviews Carousel
---------------------------------------------------- */
function initReviewsCarousel() {
  const track = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('reviewsPrevBtn');
  const nextBtn = document.getElementById('reviewsNextBtn');
  const dotsContainer = document.getElementById('reviewsDots');

  if (!track) return;

  const slides = Array.from(track.children);
  if (slides.length === 0) return;

  let currentIndex = 0;
  let autoSlideTimer = null;

  function getVisibleSlides() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  }

  function getMaxIndex() {
    return Math.max(0, slides.length - getVisibleSlides());
  }

  function renderDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const maxIdx = getMaxIndex();

    for (let i = 0; i <= maxIdx; i++) {
      const dot = document.createElement('button');
      dot.className = `h-3 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-gold w-8' : 'bg-gold/30 hover:bg-gold/60 w-3'}`;
      dot.setAttribute('aria-label', `Go to review slide ${i + 1}`);
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel();
        resetTimer();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateCarousel() {
    const maxIdx = getMaxIndex();
    if (currentIndex > maxIdx) currentIndex = 0;
    if (currentIndex < 0) currentIndex = maxIdx;

    const visibleSlides = getVisibleSlides();
    const slideWidthPercent = 100 / visibleSlides;
    const moveAmount = currentIndex * slideWidthPercent;

    track.style.transform = `translateX(-${moveAmount}%)`;

    if (dotsContainer) {
      const dots = Array.from(dotsContainer.children);
      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.className = 'w-8 h-3 rounded-full bg-gold transition-all duration-300';
        } else {
          dot.className = 'w-3 h-3 rounded-full bg-gold/30 hover:bg-gold/60 transition-all duration-300';
        }
      });
    }
  }

  function nextSlide() {
    const maxIdx = getMaxIndex();
    if (currentIndex >= maxIdx) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    updateCarousel();
  }

  function prevSlide() {
    const maxIdx = getMaxIndex();
    if (currentIndex <= 0) {
      currentIndex = maxIdx;
    } else {
      currentIndex--;
    }
    updateCarousel();
  }

  function startTimer() {
    stopTimer();
    autoSlideTimer = setInterval(nextSlide, 3500); // Auto-glides every 3.5 seconds
  }

  function stopTimer() {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
  }

  function resetTimer() {
    startTimer();
  }

  nextBtn?.addEventListener('click', () => {
    nextSlide();
    resetTimer();
  });

  prevBtn?.addEventListener('click', () => {
    prevSlide();
    resetTimer();
  });

  const wrapper = document.getElementById('reviewsCarouselWrapper');
  wrapper?.addEventListener('mouseenter', stopTimer);
  wrapper?.addEventListener('mouseleave', startTimer);
  wrapper?.addEventListener('touchstart', stopTimer);
  wrapper?.addEventListener('touchend', startTimer);

  window.addEventListener('resize', () => {
    renderDots();
    updateCarousel();
  });

  renderDots();
  updateCarousel();
  startTimer();
}
