/**
 * In-app guided tour using driver.js.
 * Walks a homeowner through the core validation story.
 */

import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

export function startTutorial(options?: {
  onHighlightSolar?: () => void;
  onHighlightPool?: () => void;
  onHighlightTime?: () => void;
}) {
  const steps: DriveStep[] = [
    {
      element: "#tour-canvas-host",
      popover: {
        title: "Your home, in true 3D",
        description:
          "This is a real house from Google Photorealistic 3D Tiles — not a sketch. Orbit with the left mouse button, zoom with the scroll wheel, and pan with right-click or middle mouse.",
        side: "left",
        align: "start",
      },
    },
    {
      element: "#toggle-solar",
      popover: {
        title: "Preview solar panels",
        description:
          "Turn on a rooftop solar array. Panels are laid out in a realistic grid with proper tilt so you can judge how they look on the actual roof.",
        side: "right",
        align: "start",
        onNextClick: (_el, _step, { driver: d }) => {
          options?.onHighlightSolar?.();
          d.moveNext();
        },
      },
    },
    {
      element: "#toggle-pool",
      popover: {
        title: "Add a backyard pool",
        description:
          "Imagine a swimming pool and deck in the yard. Toggle it on to see how outdoor renovations sit on the real property footprint.",
        side: "right",
        align: "start",
        onNextClick: (_el, _step, { driver: d }) => {
          options?.onHighlightPool?.();
          d.moveNext();
        },
      },
    },
    {
      element: "#time-of-day-controls",
      popover: {
        title: "Watch the sun move",
        description:
          "Drag the time slider or try Golden Hour / Midday / Evening. Realistic sun position casts shadows on the house, panels, and pool — critical for comfort and solar performance.",
        side: "top",
        align: "center",
        onNextClick: (_el, _step, { driver: d }) => {
          options?.onHighlightTime?.();
          d.moveNext();
        },
      },
    },
    {
      element: "#info-card",
      popover: {
        title: "Decide with confidence",
        description:
          "This personal preview is what a homeowner could receive before calling a contractor. Share the view, reset the camera, and explore until the renovation feels right.",
        side: "right",
        align: "start",
      },
    },
  ];

  const d = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayColor: "rgba(2, 6, 23, 0.72)",
    stagePadding: 8,
    stageRadius: 12,
    popoverClass: "solarreno-driver-theme",
    nextBtnText: "Next",
    prevBtnText: "Back",
    doneBtnText: "Start exploring",
    steps,
  });

  d.drive();
  return d;
}
