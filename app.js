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
  initFloatingWidget();
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

  setupBookingInputs('page');

  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  if (serviceParam) {
    bookingData.service = serviceParam;
    const choices = document.querySelectorAll('.page-service-choice');
    choices.forEach(card => {
      const val = card.getAttribute('data-value');
      const icon = card.querySelector('.service-check-icon');
      if (val === serviceParam) {
        card.classList.add('border-gold', 'bg-sand-card', 'border-2', 'selected', 'shadow-md');
        card.classList.remove('border-sand-border');
        if (icon) { icon.classList.remove('opacity-0'); icon.classList.add('opacity-100'); }
      } else {
        card.classList.remove('border-gold', 'bg-sand-card', 'border-2', 'selected', 'shadow-md');
        card.classList.add('border-sand-border');
        if (icon) { icon.classList.add('opacity-0'); icon.classList.remove('opacity-100'); }
      }
    });
  }

  const nextBtn = document.getElementById('pageBookingNextBtn');
  const prevBtn = document.getElementById('pageBookingPrevBtn');

  nextBtn?.addEventListener('click', () => handleBookingNext('page'));
  prevBtn?.addEventListener('click', () => handleBookingPrev('page'));

  updateBookingWizardStep(1, 'page');
  updateSummaryDisplay();
}

function updateSummaryDisplay() {
  const sumService = document.getElementById('pageSummaryService') || document.getElementById('summaryService');
  const sumDateTime = document.getElementById('pageSummaryDateTime') || document.getElementById('summaryDateTime');
  const sumClient = document.getElementById('pageSummaryClient') || document.getElementById('summaryClient');

  if (sumService) {
    sumService.textContent = bookingData.service || 'Deep Tissue Body Therapy';
  }
  if (sumDateTime) {
    const formattedDate = bookingData.date ? bookingData.date : 'Tomorrow';
    sumDateTime.textContent = `${formattedDate} at ${bookingData.time || '10:00 AM'}`;
  }
  if (sumClient) {
    if (bookingData.name && bookingData.email) {
      sumClient.textContent = `${bookingData.name} (${bookingData.email})`;
    } else if (bookingData.name) {
      sumClient.textContent = bookingData.name;
    } else {
      sumClient.textContent = 'Gents Client';
    }
  }
}

function setupBookingInputs(context = 'modal') {
  const prefix = context === 'page' ? 'page' : '';

  const serviceChoices = document.querySelectorAll(`.${prefix ? prefix + '-' : ''}service-choice`);
  serviceChoices.forEach(card => {
    card.addEventListener('click', () => {
      serviceChoices.forEach(c => {
        c.classList.remove('border-gold', 'bg-sand-card', 'border-2', 'selected', 'shadow-md');
        c.classList.add('border-sand-border');
        const icon = c.querySelector('.service-check-icon');
        if (icon) {
          icon.classList.add('opacity-0');
          icon.classList.remove('opacity-100');
        }
      });
      card.classList.remove('border-sand-border');
      card.classList.add('border-gold', 'bg-sand-card', 'border-2', 'selected', 'shadow-md');
      const icon = card.querySelector('.service-check-icon');
      if (icon) {
        icon.classList.remove('opacity-0');
        icon.classList.add('opacity-100');
      }
      bookingData.service = card.getAttribute('data-value') || bookingData.service;
      updateSummaryDisplay();
    });
  });

  const formatChoices = document.querySelectorAll(`.${prefix ? prefix + '-' : ''}format-choice`);
  formatChoices.forEach(btn => {
    btn.addEventListener('click', () => {
      formatChoices.forEach(b => b.classList.remove('bg-emerald-dark', 'text-gold'));
      btn.classList.add('bg-emerald-dark', 'text-gold');
      bookingData.format = btn.innerText;
      updateSummaryDisplay();
    });
  });

  const timeSlots = document.querySelectorAll(`.${prefix ? prefix + '-' : ''}time-slot-btn`);
  timeSlots.forEach(btn => {
    btn.addEventListener('click', () => {
      timeSlots.forEach(b => b.classList.remove('bg-emerald-dark', 'text-gold', 'border-gold'));
      btn.classList.add('bg-emerald-dark', 'text-gold', 'border-gold');
      bookingData.time = btn.innerText;
      updateSummaryDisplay();
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
      updateSummaryDisplay();
    });
  }
}

function handleBookingNext(context = 'modal') {
  const prefix = context === 'page' ? 'page' : '';
  
  if (currentBookingStep === 1) {
    updateBookingWizardStep(2, context);
    updateSummaryDisplay();
  } else if (currentBookingStep === 2) {
    updateBookingWizardStep(3, context);
    updateSummaryDisplay();
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

    updateSummaryDisplay();
    updateBookingWizardStep(4, context);
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

    const whatsappMessage = `*New Direct Inquiry - Aran Therapy Center*\n\n` +
      `👤 *Name:* ${name}\n` +
      `📧 *Email:* ${email}\n` +
      `💬 *Message:* ${message}`;

    const phoneNumber = '919876543210';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    showToast('Redirecting to WhatsApp with your inquiry details...', 'success');

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      form.reset();
    }, 600);
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

/* ----------------------------------------------------
   Floating Action Widget (WhatsApp & Call Buttons)
---------------------------------------------------- */
function initFloatingWidget() {
  if (document.getElementById('floatingContactWidget')) return;

  const widget = document.createElement('div');
  widget.id = 'floatingContactWidget';
  widget.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 items-center animate-fade-in';
  widget.innerHTML = `
    <!-- Call Floating Button -->
    <a href="tel:+919876543210" class="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-dark text-gold border border-gold/70 flex items-center justify-center shadow-xl hover:scale-105 hover:bg-gold hover:text-emerald-dark transition-all duration-300 group relative" title="Call Us Direct (+91 9876543210)" aria-label="Call Us Direct">
      <svg class="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
        <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.4-.1-.8 0-1.1.3l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.3-1.1-.4-1.2-.6-2.4-.6-3.6 0-.6-.5-1-1-1H3.5c-.6 0-1 .4-1 1C2.5 13.9 10.1 21.5 19.5 21.5c.6 0 1-.4 1-1v-4c0-.5-.4-1-1-1z"/>
      </svg>
      <span class="absolute right-13 bg-emerald-dark text-gold text-xs font-bold px-2 py-0.5 rounded-lg border border-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none">Call Now</span>
    </a>

    <!-- WhatsApp Floating Button -->
    <a href="https://wa.me/919876543210" target="_blank" rel="noopener" class="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#25D366] text-white border border-white/30 flex items-center justify-center shadow-xl hover:scale-105 hover:bg-[#20ba5a] transition-all duration-300 group relative" title="WhatsApp Chat" aria-label="WhatsApp Chat">
      <svg class="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-current" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.285-.143-1.689-.834-1.951-.929-.262-.095-.453-.143-.645.143-.19.285-.738.929-.905 1.119-.167.19-.333.214-.618.071-.285-.143-1.205-.444-2.296-1.417-.848-.757-1.421-1.692-1.587-1.977-.167-.285-.018-.439.125-.581.129-.128.285-.333.428-.5.143-.167.19-.285.285-.476.095-.19.048-.357-.024-.5-.071-.143-.645-1.554-.883-2.127-.233-.558-.47-.482-.645-.491l-.547-.01c-.19 0-.499.071-.761.357-.262.285-1.001.977-1.001 2.385 0 1.407 1.025 2.766 1.168 2.956.143.19 2.019 3.084 4.891 4.324.684.295 1.218.471 1.634.603.687.218 1.312.187 1.806.114.552-.082 1.689-.69 1.927-1.357.238-.667.238-1.238.167-1.357-.07-.119-.261-.19-.546-.333z"/>
      </svg>
      <span class="absolute right-13 bg-emerald-dark text-gold text-xs font-bold px-2 py-0.5 rounded-lg border border-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none">WhatsApp Us</span>
    </a>
  `;
  document.body.appendChild(widget);
}
