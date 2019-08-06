let isFirst = true;

function moveOptionSelector(from, to, prevOpPos, isDirect) {
    if (!isDirect) {
        if (isForm) {
            virtualPath.pop();
            isForm = false;
        }
        update(true);
    } else {
        update(false); 
    }

    if (isFirst) {
        optionSelector.style.top = optionPosition + 'px';
        isFirst = false;
        return;
    }

    const indexIncrement = to - from;
    const frames = 25;
    const animationTime = 1;

    const targetOffset = buttonMargin * indexIncrement;
    const pxIncrement = targetOffset / frames;

    let selectorPosition = prevOpPos;
    const targetPosition = selectorPosition + targetOffset;

    let move = () => {
        const weight = Math.sin(Math.PI * (targetPosition - selectorPosition) / targetOffset);
        const newPosition = selectorPosition + pxIncrement * Math.max(weight, 0.1);

        optionSelector.style.top = newPosition + 'px';
        selectorPosition = newPosition;

        if (
            newPosition < targetPosition && targetOffset > 0 ||
            newPosition > targetPosition && targetOffset < 0
        ) {
            setTimeout(move, animationTime / frames);
        }
    };
    move();
}
