class TypingSimulator {
  constructor(speed, errorRate) {
    this.speed = speed;
    this.errorRate = errorRate;
    this.typoMap = {
      'a': 's', 's': 'a', 'd': 'f', 'f': 'd', 'g': 'h', 'h': 'g',
      'j': 'k', 'k': 'j', 'l': ';', 'o': 'p', 'p': 'o'
    };
  }

  pause(minMs, maxMs = minMs) {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  shouldMakeTypo() {
    return Math.random() < this.errorRate;
  }

  generateTypoChar(char) {
    return this.typoMap[char.toLowerCase()] || char;
  }

  async typeText(text, callback, playSound) {
    let currentText = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (this.shouldMakeTypo() && /[a-zA-Z]/.test(char)) {
        const typoChar = this.generateTypoChar(char);
        currentText += typoChar;
        callback(currentText);
        if (playSound) playSound(typoChar);
        await this.pause(800, 1500);
        currentText = currentText.slice(0, -1);
        callback(currentText);
        await this.pause(200, 400);
        currentText += char;
        callback(currentText);
        if (playSound) playSound(char);
      } else {
        currentText += char;
        callback(currentText);
        if (playSound) playSound(char);
      }
      let delay = Math.random() * (this.speed.max - this.speed.min) + this.speed.min;
      if ([
        ' ', '.', ',', ';', ':', '{', '}', '(', ')', '[', ']', '"', "'"
      ].includes(char)) {
        delay *= 0.2;
      }
      if ([
        '=', '+', '-', '*', '/', '<', '>', '!', '&', '|'
      ].includes(char)) {
        delay *= 0.5;
      }
      if (char === '\n') {
        delay *= 0.8;
      }
      delay = Math.min(delay, this.speed.max * 0.8);
      await this.pause(delay);
    }
  }
}

export default TypingSimulator; 