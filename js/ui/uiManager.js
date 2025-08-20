// UI Manager Module
class UIManager {
  constructor(terminal) {
    this.terminal = terminal;
    this.blockCaret = document.getElementById("block-caret");
    this.inputMeasure = document.getElementById("input-measure");
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateBlockCaretPosition();
  }

  setupEventListeners() {
    const commandInput = this.terminal.getCommandInput();
    
    ["input", "keyup", "click", "focus"].forEach((evt) => {
      commandInput.addEventListener(evt, () => this.updateBlockCaretPosition());
    });
    
    document.addEventListener("selectionchange", () => {
      if (document.activeElement === commandInput) {
        this.updateBlockCaretPosition();
      }
    });
    
    commandInput.addEventListener("blur", () => {
      this.blockCaret.style.display = "none";
    });
  }

  updateBlockCaretPosition() {
    const input = this.terminal.getCommandInput();
    
    if (!document.activeElement || document.activeElement !== input) {
      this.blockCaret.style.display = "none";
      return;
    }

    this.blockCaret.style.display = "block";

    // Mirror text up to caret to measure width
    const caretIndex = input.selectionStart || 0;
    const textBeforeCaret = input.value.slice(0, caretIndex);
    this.inputMeasure.textContent = textBeforeCaret;

    // Ensure measurement uses same font metrics
    const computed = getComputedStyle(input);
    this.inputMeasure.style.font = computed.font;
    this.inputMeasure.style.letterSpacing = computed.letterSpacing;
    this.inputMeasure.style.left = 0;
    this.inputMeasure.style.top = 0;

    // Compute position within container
    const containerRect = input.parentElement.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    const leftPadding = parseFloat(computed.paddingLeft) || 0;
    const leftWithinContainer =
      inputRect.left -
      containerRect.left +
      leftPadding +
      this.inputMeasure.offsetWidth -
      input.scrollLeft;

    // Position caret
    this.blockCaret.style.left = leftWithinContainer + "px";
    this.blockCaret.style.top = inputRect.top - containerRect.top + "px";

    // Match caret height to line-height
    this.blockCaret.style.height = computed.lineHeight;
  }
}

window.UIManager = UIManager;
