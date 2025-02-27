function addEmoji(data) {
  const userElementEmoji = document.getElementById(`user-${data.id}-emoji`);
  if (userElementEmoji) {
    userElementEmoji.textContent = data.emoji;
    userElementEmoji.style.opacity = '1';
    let ele = document.createElement('span');
    ele.className = "emoji";
    ele.textContent = data.emoji;
    ele.style.left = `${userElementEmoji.offsetLeft}px`;
    userElementEmoji.parentElement.appendChild(ele);
    let startPosition = 0;
    let xOffset = 0;
    const randomStartX = userElementEmoji.offsetLeft + Math.random() * 20 - 10;
    const wiggleAmplitude = 5;
    const wiggleFrequency = 0.1;
    const animationDuration = 5000;
    const animationInterval = 50;
    const totalSteps = animationDuration / animationInterval;
    const moveStep = 1000 / totalSteps;

    ele.style.position = 'absolute';
    ele.style.opacity = '1';
    ele.style.transition = 'opacity 0.5s ease-out';
    ele.style.left = `${randomStartX}px`;

    const floatAnimation = setInterval(() => {
      startPosition += moveStep;
      xOffset = Math.sin(startPosition * wiggleFrequency) * wiggleAmplitude;

      ele.style.bottom = `${startPosition}px`;
      ele.style.left = `${randomStartX + xOffset}px`;

      if (startPosition > (100 / totalSteps) * (totalSteps - 20)) {
        ele.style.opacity = '0';
      }
    }, animationInterval);
    const animationTimeout = setTimeout(() => {
      if (ele.parentNode) {
        ele.parentNode.removeChild(ele);
      }
    }, animationDuration);

    const resetTimeout = setTimeout(() => {
      if (userElementEmoji) {
        userElementEmoji.textContent = '😑';
        userElementEmoji.style.opacity = '0';
      }
    }, animationDuration + 500);

    if (userElementEmoji.resetTimeout) {
      clearTimeout(userElementEmoji.resetTimeout);
    }
    userElementEmoji.resetTimeout = resetTimeout;
    userElementEmoji.animationTimeout = animationTimeout;
  }
}
export { addEmoji };