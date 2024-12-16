function cardHover(e) {
  const THRESHOLD = 13;
  const { clientX, clientY, currentTarget } = e;
  const { clientWidth, clientHeight, offsetLeft, offsetTop } = currentTarget;

  const horizontal = (clientX - offsetLeft) / clientWidth;
  const vertical = (clientY - offsetTop) / clientHeight;
  const rotateX = (THRESHOLD / 2 - horizontal * THRESHOLD).toFixed(2);
  const rotateY = (vertical * THRESHOLD - THRESHOLD / 2).toFixed(2);

  const isVertical = e.target.classList.contains("rotate90") ? "rotate(90deg)" : "";

  e.target.style.transition = "0.1s linear";
  e.target.style.transform = `perspective(${clientWidth}px) rotateX(${rotateY}deg) rotateY(${rotateX}deg) scale3d(1.1, 1.1, 1) ${isVertical}`;
}

function cardLeave(e) {
  e.target.style.transform = `perspective(${e.target.parentElement.clientWidth}px) rotateX(0deg) rotateY(0deg)`;
}
export { cardHover, cardLeave };
