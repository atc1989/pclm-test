export function animateIntegerText(
  element: HTMLElement,
  from: number,
  to: number,
  durationMs: number,
) {
  const start = performance.now();

  function tick(timestamp: number) {
    const progress = Math.min((timestamp - start) / durationMs, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    element.textContent = String(Math.round(from + (to - from) * eased));

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

export function countUp(element: HTMLElement, to: number, durationMs = 1400) {
  animateIntegerText(element, 0, to, durationMs);
}

export function observeReveal(
  selector = ".rv",
  options: IntersectionObserverInit = {
    threshold: 0.08,
    rootMargin: "0px 0px -32px 0px",
  },
) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
      }
    });
  }, options);

  document.querySelectorAll(selector).forEach((el) => observer.observe(el));

  return observer;
}

export function observeCounters(
  options: IntersectionObserverInit = { threshold: 0.5 },
) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const target = entry.target as HTMLElement;
      const value = Number(target.dataset.count ?? "0");

      if (value) {
        countUp(target, value);
      }

      observer.unobserve(target);
    });
  }, options);

  document
    .querySelectorAll<HTMLElement>("[data-count]")
    .forEach((el) => observer.observe(el));

  return observer;
}

export function scrollToElementId(id: string | undefined) {
  if (!id) {
    return;
  }

  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function animateSvgRadius(
  id: string,
  from: number,
  to: number,
  durationMs: number,
) {
  const element = document.getElementById(id);
  const start = performance.now();

  if (!element) {
    return;
  }

  const target = element;

  function tick(timestamp: number) {
    const progress = Math.min((timestamp - start) / durationMs, 1);
    const eased = 1 - Math.pow(1 - progress, 2);

    target.setAttribute("r", String(from + (to - from) * eased));

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}
