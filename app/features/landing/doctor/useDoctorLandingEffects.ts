"use client";

import { useEffect } from "react";
import {
  animateSvgRadius,
  observeCounters,
  observeReveal,
  scrollToElementId,
} from "../shared/browserAnimations";
import { textElement } from "../shared/dom";
import {
  type DoctorRingScenario,
  doctorRingScenarios,
} from "./doctorRingScenarios";

export function useDoctorLandingEffects() {
  useEffect(() => {
    const nav = document.getElementById("nav");
    const rFill = document.getElementById("rFill");
    const rNum = document.getElementById("rNum") as HTMLElement | null;
    const rGlow = document.getElementById("ringGlow") as HTMLElement | null;
    const rVerdict = document.getElementById("rVerdict");
    const rVS = document.getElementById("rVerdictStrong") as HTMLElement | null;
    const rChips = document.getElementById("rChips");
    let scenarioIndex = 0;
    let numberInterval: number | undefined;

    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 20);
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const scrollControl = target?.closest<HTMLElement>("[data-scroll-target]");
      const anchor = target?.closest<HTMLAnchorElement>('a[href^="#"]');

      if (scrollControl) {
        scrollToElementId(scrollControl.dataset.scrollTarget);
      }

      if (anchor) {
        const id = anchor.getAttribute("href");
        if (id && id.length > 1) {
          event.preventDefault();
          document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    const animateNumber = (from: number, to: number, color: string) => {
      let i = 0;
      const steps = 80;

      if (numberInterval) {
        window.clearInterval(numberInterval);
      }

      if (rNum) {
        rNum.style.color = color;
      }

      numberInterval = window.setInterval(() => {
        if (!rNum) {
          return;
        }

        i += 1;
        const t = i / steps;
        const eased = t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1;
        rNum.textContent = String(Math.round(from + (to - from) * eased));

        if (i >= steps) {
          rNum.textContent = String(to);
          window.clearInterval(numberInterval);
        }
      }, 48);
    };

    const updateRing = (scenario: DoctorRingScenario) => {
      rFill?.style.setProperty("--ra", `${scenario.score * 3.6}deg`);

      if (rGlow) {
        rGlow.style.background = scenario.glowCol;
      }

      animateNumber(Number.parseInt(rNum?.textContent ?? "0", 10) || 0, scenario.score, scenario.numCol);

      if (rVS) {
        rVS.textContent = scenario.verdict;
        rVS.style.color = scenario.verdictCol;
      }

      if (rVerdict && rVS) {
        rVerdict.replaceChildren(rVS, document.createElement("br"), document.createTextNode(scenario.desc));
      }

      if (rChips) {
        rChips.replaceChildren(
          ...scenario.chips.map((chip) =>
            textElement("span", `ring-chip ${chip[1]}`, chip[0]),
          ),
        );
      }

      [
        ["rdCrp", "hs-CRP", scenario.crp],
        ["rdNlr", "NLR", scenario.nlr],
        ["rdHdl", "HDL", scenario.hdl],
        ["rdGlu", "Glucose", scenario.glu],
      ].forEach(([id, label, value]) => {
        const el = document.getElementById(id);
        if (el) {
          el.replaceChildren(
            textElement("div", "ring-data-name", label),
            textElement("div", "ring-data-val", value),
          );
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    onScroll();

    const revealObserver = observeReveal(".rv", {
      threshold: 0.1,
      rootMargin: "0px 0px -36px 0px",
    });
    const countObserver = observeCounters({ threshold: 0.6 });

    const chartObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          [
            ["trajSeg1", 173, 0],
            ["trajSeg2", 173, 480],
          ].forEach(([id, length, delay]) => {
            const segment = document.getElementById(String(id));

            if (!segment) {
              return;
            }

            const lineSegment = segment;

            lineSegment.style.strokeDasharray = String(length);
            lineSegment.style.strokeDashoffset = String(length);

            window.setTimeout(() => {
              const start = performance.now();

              function tick(timestamp: number) {
                const progress = Math.min((timestamp - start) / 700, 1);
                const eased = 1 - Math.pow(1 - progress, 3);

                lineSegment.style.strokeDashoffset = String(Number(length) * (1 - eased));

                if (progress < 1) {
                  requestAnimationFrame(tick);
                }
              }

              requestAnimationFrame(tick);
            }, Number(delay));
          });

          [
            [1, 100],
            [2, 550],
            [3, 980],
          ].forEach(([id, delay]) => {
            window.setTimeout(() => {
              animateSvgRadius(`d${id}`, 0, 6, 350);
              animateSvgRadius(`d${id}halo`, 0, 14, 500);
            }, delay);
          });

          window.setTimeout(() => {
            const labels = document.getElementById("tpLabels");
            if (labels) {
              labels.style.transition = "opacity .5s";
              labels.style.opacity = "1";
            }
          }, 1350);

          chartObserver.disconnect();
        });
      },
      { threshold: 0.25 },
    );

    const chart = document.getElementById("trajSVG");
    if (chart) {
      chartObserver.observe(chart);
    }

    const ringTimeout = window.setTimeout(() => {
      updateRing(doctorRingScenarios[0]);
    }, 900);
    const ringInterval = window.setInterval(() => {
      scenarioIndex = (scenarioIndex + 1) % doctorRingScenarios.length;
      updateRing(doctorRingScenarios[scenarioIndex]);
    }, 5000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      revealObserver.disconnect();
      countObserver.disconnect();
      chartObserver.disconnect();
      window.clearTimeout(ringTimeout);
      window.clearInterval(ringInterval);

      if (numberInterval) {
        window.clearInterval(numberInterval);
      }
    };
  }, []);
}
