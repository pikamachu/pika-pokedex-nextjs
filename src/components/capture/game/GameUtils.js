export const getElementById = (id) => document.getElementById(id);

export const getFirstElement = (className) => document.getElementsByClassName(className)[0];

export const getCenterCoords = (element) => {
  const rect = element?.getBoundingClientRect
    ? element.getBoundingClientRect()
    : getElementById(element)?.getBoundingClientRect();
  return (
    rect && {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }
  );
};

export const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export const setTransform = (element, rotation, scale, skewX, skewY) => {
  console.log(`transform: id ${element.id} class ${element.className}`);
  const transformString = `rotate(${rotation}deg ) scale(${scale}) skewX(${skewX}deg ) skewY(${skewY}deg )`;
  element.style.webkitTransform = transformString;
  element.style.MozTransform = transformString;
  element.style.msTransform = transformString;
  element.style.OTransform = transformString;
  element.style.transform = transformString;
};

export const clearContainerElement = (element) => {
  const containerElement = getContainerElement(element);
  if (containerElement) {
    containerElement.innerHTML = '';
  }
};

export const clearElementTransforms = (element) => {
  const containerElement = getContainerElement(element);
  if (containerElement) {
    containerElement.style.transform = '';
  }
};

export const setElementImage = (element, image) => {
  const containerElement = getContainerElement(element);
  if (containerElement) {
    containerElement.style.backgroundImage = `url('${image}')`;
  }
};

export const hideElement = (element) => {
  const containerElement = getContainerElement(element);
  if (containerElement) {
    containerElement.classList.toggle('hidden');
  }
};

export const activeElement = (element) => {
  const containerElement = getContainerElement(element);
  if (containerElement) {
    containerElement.classList.toggle('active');
  }
};

const getContainerElement = (element) => {
  return typeof element === 'string' ? getFirstElement(element) : element;
};

export const getTranslationBetweenElements = (element1, element2) => {
  const position1 = getCenterCoords(element1);
  const position2 = getCenterCoords(element2);

  return {
    x: position2.x - position1.x,
    y: position2.y - position1.y
  };
};

export const getDistanceBetweenElements = (element1, element2) => {
  const translation = getTranslationBetweenElements(element1, element2);
  return Math.hypot(translation.x, translation.y);
};
