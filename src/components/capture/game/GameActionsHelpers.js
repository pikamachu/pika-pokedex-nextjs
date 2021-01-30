import { Resources } from './GameResourcesHelpers';
import { getFirstElement, getRandomNumber, clearContainerElement } from './GameUtils';
import { findCollidableElement, elementColisionTransform } from './GameCollisionsHelpers';
import {
  emitBallColisionParticles,
  restoreBallEffect,
  removeElementAnimation,
  throwEffect1,
  throwEffect2,
  moveElementAsideEffect,
  emitParticlesToElementEffect,
  fadeElementEffect,
  dropElementEffect,
  shakeEffect,
  rainConfettiEffect,
  poofEffect
} from './GameEffectsHelpers';

export const createGameActions = (ball, target, screen, state, captureSuccessCallback) => {
  const checkBallColisions = () => {
    if (!ball.colision) {
      const ballCoords = ball.getCenterCoords();
      if (ballCoords) {
        const elements = document.elementsFromPoint(ballCoords.x, ballCoords.y);
        var elementColision = findCollidableElement(elements);
        if (elementColision) {
          console.log('Ball colision' + elementColision);
          ball.colision = true;
          elementColisionTransform(elementColision, elements);
          emitBallColisionParticles(ball, elementColision);
          restoreBallEffect(ball);
        }
      }
    }
  };

  const pointerBall = (coords, final) => {
    if (coords) {
      ball.moveBallPointer(coords.x, coords.y);
    }
    if (final && !ball.inMotion) {
      restoreBallEffect(ball);
    }
  };

  const throwBall = (angle, deltaY, velocity) => {
    ball.inMotion = true;
    let maxVelocity = screen.height * 0.009;
    velocity = Math.abs(velocity);
    if (velocity > maxVelocity) {
      velocity = maxVelocity;
    }
    // Determine the final position.
    const scalePercent = Math.log(velocity + 1) / Math.log(maxVelocity + 1);
    const movementY = deltaY;
    // Determine how far it needs to travel from the current position to the destination.
    const translateYValue = -0.75 * screen.height * scalePercent;
    const translateXValue = -1 * (angle + 90) * (translateYValue / 100);

    removeElementAnimation('.ring-fill');

    throwEffect1(ball.getElement(), translateXValue, movementY, scalePercent, () => {
      if (movementY < 0) {
        throwBall2(movementY, translateXValue, scalePercent);
      } else {
        setTimeout(state.resetState, 400);
      }
    });
  };

  const throwBall2 = (movementY, translateXValue, scalePercent) => {
    // Treat translations as fixed.
    ball.savePosition();
    throwEffect2(ball.getElement(), movementY, translateXValue, scalePercent, determineThrowResult);
  };

  const determineThrowResult = () => {
    // Determine if the ball is touching the target.
    const targetCoords = target.getCenterCoords();
    const ballCoords = ball.getCenterCoords();
    const radius = target.getRadius();
    if (
      ballCoords.x > targetCoords.x - radius &&
      ballCoords.x < targetCoords.x + radius &&
      ballCoords.y > targetCoords.y - radius &&
      ballCoords.y < targetCoords.y + radius
    ) {
      // Capture success
      if (target.motion) {
        target.motion.pause();
      }
      ball.savePosition();
      const ballElement = ball.getElement();
      const ballOrientation = ballCoords.x < targetCoords.x ? -1 : 1;
      moveElementAsideEffect(ballElement, radius, ballOrientation, () => {
        ballElement.style.backgroundImage = `url('${Resources.pikaballOpened}')`;
        emitTargetParticlesToBall();
      });
    } else {
      // Capture fail
      setTimeout(state.resetState, 400);
    }
  };

  const emitTargetParticlesToBall = () => {
    const targetCoords = target.getCenterCoords();
    const ballElement = ball.getElement();
    const particleContainer = getFirstElement('particle-container');

    emitParticlesToElementEffect(ballElement, ball.size, targetCoords, particleContainer);
    fadeElementEffect(target.getElement());

    setTimeout(closingCaptureBall, 1000);
  };

  const closingCaptureBall = () => {
    const ballElement = ball.getElement();
    ballElement.style.backgroundImage = `url('${Resources.pikaballClosed}')`;
    clearContainerElement('particle-container');
    ball.savePosition();

    dropElementEffect(ball.getElement(), () => {
      ball.resetBall();
      state.resetState();
      animateCaptureState();
    });
  };

  const animateCaptureState = () => {
    const ballContainer = getFirstElement('capture-screen');
    ballContainer.classList.toggle('hidden');

    const buttonContainer = getFirstElement('capture-ball-button-container');
    buttonContainer.classList.toggle('hidden');

    const duration = 500;
    shakeEffect('.capture-ball', duration);

    const ringRect = getFirstElement('ring-active').getBoundingClientRect();
    const successRate = ((150 - ringRect.width) / 150) * 100;
    const seed = getRandomNumber(0, 100);
    setTimeout(() => {
      removeElementAnimation('.capture-ball');

      if (seed < Math.floor(successRate)) {
        showCaptureSuccess();
      } else {
        showEscapeAnimationAndContinue();
      }
    }, duration * 6);
  };

  const showCaptureSuccess = () => {
    const captureBallButton = getFirstElement('capture-ball-button');
    captureBallButton.classList.toggle('active');

    const captureStatus = getFirstElement('capture-status');
    captureStatus.classList.toggle('hidden');

    const particleContainer = getFirstElement('capture-confetti');
    rainConfettiEffect(particleContainer, () => {
      clearContainerElement(particleContainer);
      captureSuccessCallback();
    });
  };

  const showEscapeAnimationAndContinue = () => {
    const buttonContainer = getFirstElement('capture-ball-button-container');
    buttonContainer.classList.toggle('hidden');

    const poofContainer = getFirstElement('poof-container');
    poofContainer.classList.toggle('hidden');

    const poofElement = getFirstElement('poof');

    poofEffect(poofElement, hideEscapeAnimation);
  };

  const hideEscapeAnimation = () => {
    const ballContainer = getFirstElement('capture-screen');
    ballContainer.classList.toggle('hidden');
    const poofEle = getFirstElement('poof');
    poofEle.style.transform = '';
    const poofContainer = getFirstElement('poof-container');
    poofContainer.classList.toggle('hidden');
  };

  return {
    checkBallColisions,
    pointerBall,
    throwBall
  };
};
