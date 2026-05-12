"use client";

import { useEffect } from "react";
import {
  animateIntegerText,
  observeCounters,
  observeReveal,
  scrollToElementId,
} from "../shared/browserAnimations";
import { textElement } from "../shared/dom";
import { patientHeroStates } from "./patientHeroStates";

export function usePatientLandingEffects() {
  useEffect(() => {
    const nav = document.getElementById("nav");
    const sticky = document.getElementById("sticky");
    const wa = document.getElementById("wa");
    const heroSec = document.getElementById("hero");
    const heroRing = document.getElementById("heroRing");
    const heroGlow = document.getElementById("heroGlow") as HTMLElement | null;
    const heroScore = document.getElementById("heroScore") as HTMLElement | null;
    const heroVerdict = document.getElementById("heroVerdict") as HTMLElement | null;
    const heroChips = document.getElementById("heroChips");
    const rb0 = document.getElementById("rb0");
    const rb1 = document.getElementById("rb1");
    let currentScore = 74;
    let cycleState: "before" | "after" = "before";

    const setHero = (state: "before" | "after") => {
      const data = patientHeroStates[state];

      heroRing?.style.setProperty("--ra", `${data.ra}deg`);

      if (heroGlow) {
        heroGlow.style.background = data.glow;
      }

      if (heroScore) {
        animateIntegerText(heroScore, currentScore, data.score, 900);
        heroScore.style.color = data.color;
      }

      if (heroVerdict) {
        heroVerdict.textContent = data.verdict;
        heroVerdict.style.color = data.color;
      }

      if (heroChips) {
        heroChips.replaceChildren(
          ...data.chips.map((chip) =>
            textElement("span", `chip-marker ${chip.c}`, chip.l),
          ),
        );
      }

      currentScore = data.score;
      rb0?.classList.toggle("on", state === "before");
      rb1?.classList.toggle("on", state === "after");
    };

    const onScroll = () => {
      nav?.classList.toggle("stuck", window.scrollY > 60);

      if (sticky && wa && heroSec) {
        const past = window.scrollY > heroSec.offsetHeight * 0.6;
        sticky.classList.toggle("on", past);
        wa.classList.toggle("on", past);
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const scrollControl = target?.closest<HTMLElement>("[data-scroll-target]");
      const heroControl = target?.closest<HTMLElement>("[data-hero-state]");

      if (scrollControl) {
        scrollToElementId(scrollControl.dataset.scrollTarget);
      }

      if (heroControl?.dataset.heroState === "before" || heroControl?.dataset.heroState === "after") {
        setHero(heroControl.dataset.heroState);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    onScroll();

    const revealObserver = observeReveal();
    const countObserver = observeCounters();

    const ibarFill = document.getElementById("ibarFill");
    const ibarObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && ibarFill) {
            ibarFill.style.width = "68%";
            ibarObserver.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );

    const ibarParent = ibarFill?.closest(".inflammation-bar");
    if (ibarParent) {
      ibarObserver.observe(ibarParent);
    }

    const ringTimeout = window.setTimeout(() => {
      heroRing?.style.setProperty("--ra", `${patientHeroStates.before.ra}deg`);
    }, 700);
    const cycleInterval = window.setInterval(() => {
      cycleState = cycleState === "before" ? "after" : "before";
      setHero(cycleState);
    }, 6000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      revealObserver.disconnect();
      countObserver.disconnect();
      ibarObserver.disconnect();
      window.clearTimeout(ringTimeout);
      window.clearInterval(cycleInterval);
    };
  }, []);
}
