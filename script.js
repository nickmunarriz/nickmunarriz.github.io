/* ----------------------------------------------------
   Nick Munarriz - Sleek Personal Portfolio Interactions
   ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initActiveNavLinkObserver();
  initMetricCounters();
  initClipboardCopy();
});

/**
 * Handles smooth scrolling with offset compensation for the floating navbar
 */
function initSmoothScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  const headerOffset = 70; // aligns with var(--nav-height) in CSS

  anchors.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Update URL hash without jumping page
        history.pushState(null, null, targetId);
      }
    });
  });
}

/**
 * Highlights the current active section in the navigation bar using IntersectionObserver
 */
function initActiveNavLinkObserver() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px', // Trigger when section occupies the active middle portion
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/**
 * Animates numerical metrics when they enter the viewport
 */
function initMetricCounters() {
  const statsSection = document.getElementById('impact'); // metrics are inside the impact container
  const numbers = document.querySelectorAll('.stat-number');
  
  if (!numbers.length) return;

  const countUp = (el) => {
    const target = parseFloat(el.getAttribute('data-target'));
    const duration = 2000; // 2 seconds animation
    const startTime = performance.now();
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';

    const updateCount = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing function: easeOutQuad
      const easeProgress = progress * (2 - progress);
      const currentValue = easeProgress * target;

      if (target % 1 === 0) {
        el.textContent = `${prefix}${Math.floor(currentValue)}${suffix}`;
      } else {
        el.textContent = `${prefix}${currentValue.toFixed(1)}${suffix}`;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
      }
    };

    requestAnimationFrame(updateCount);
  };

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        numbers.forEach(num => countUp(num));
        observerInstance.unobserve(entry.target); // Run only once
      }
    });
  }, { threshold: 0.1 });

  if (statsSection) {
    observer.observe(statsSection);
  }
}

/**
 * Copies contact information to the clipboard and handles visual feedback tooltip
 */
function initClipboardCopy() {
  const contactItems = document.querySelectorAll('.contact-item');

  contactItems.forEach(item => {
    item.addEventListener('click', () => {
      const textToCopy = item.getAttribute('data-copy');
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        // Show tooltip visual state
        item.classList.add('copied');
        
        const tooltip = item.querySelector('.tooltip');
        if (tooltip) {
          tooltip.textContent = 'Copied!';
        }

        // Reset tooltip visual state after 2 seconds
        setTimeout(() => {
          item.classList.remove('copied');
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    });
  });
}
