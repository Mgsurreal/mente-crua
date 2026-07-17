function extractPrompt(markdown) {
  const match = String(markdown).match(/```(?:text)?\s*([\s\S]*?)```/i);
  return (match ? match[1] : markdown).trim();
}

async function loadPrompt(card) {
  const output = card.querySelector('[data-prompt-content]');
  try {
    const response = await fetch(card.dataset.promptSource, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const prompt = extractPrompt(await response.text());
    output.textContent = prompt;
    card._promptText = prompt;
  } catch (_) {
    output.textContent = 'Não foi possível carregar este prompt. Abra a página pelo servidor local do Mente Crua.';
  }
}

function showToast(message) {
  const toast = document.querySelector('.copy-toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 1800);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {}
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  return copied;
}

document.querySelectorAll('[data-prompt-source]').forEach((card) => {
  loadPrompt(card);
  card.querySelector('[data-copy-prompt]').addEventListener('click', async (event) => {
    if (!card._promptText) return showToast('O prompt ainda está carregando.');
    try {
      if (!await copyText(card._promptText)) throw new Error('Cópia indisponível');
      event.currentTarget.classList.add('copied');
      event.currentTarget.textContent = 'Copiado!';
      showToast('Prompt copiado para a área de transferência.');
      window.setTimeout(() => {
        event.currentTarget.classList.remove('copied');
        event.currentTarget.textContent = card.classList.contains('prompt-card--master') ? 'Copiar prompt' : 'Copiar';
      }, 1800);
    } catch (_) {
      showToast('Abra o prompt e copie o texto manualmente.');
    }
  });
});
