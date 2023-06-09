import { Elements } from "./config";

const titleElement = document.getElementById(Elements.title.id);
const getTitleBg = () => document.getElementById(Elements.title.id).style.background;
titleElement.addEventListener("click", () => {
  if (!getTitleBg()) {
    titleElement.style.background = "red";
  } else if (getTitleBg() === "red") {
    titleElement.removeAttribute("style");
  }
});

const descriptionElement = document.getElementById(Elements.description.id);
const descriptionElementInitBg = descriptionElement.style.background;
descriptionElement.addEventListener("mouseenter", () => {
  document.body.style.transition = "background .5s ease";
  document.body.style.background = "#025464";
});
descriptionElement.addEventListener("mouseleave", () => {
  const body = document.body;
  body.style.transition = "background .5s ease";
  body.style.background = descriptionElementInitBg;
});
