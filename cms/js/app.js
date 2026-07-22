document.querySelectorAll('.step').forEach((btn) => btn.addEventListener('click', () => {
  gotoStep(btn.dataset.step);
  scheduleLocalDraft();
}));
document.querySelectorAll('[data-next]').forEach((btn) => btn.addEventListener('click', () => gotoStep(btn.dataset.next)));

$('#btnProject').addEventListener('click', selectProjectRoot);
$('#btnPublishHome').addEventListener('click', publishHomeCard);
$('#btnCreateContent').addEventListener('click', createContent);
$('#btnOpenContent').addEventListener('click', openContent);
$('#btnAddImages').addEventListener('click', addImages);
$('#imageInput').addEventListener('change', handleImageInputChange);
$('#mediaLibrary').addEventListener('click', handleMediaClick);
$('#btnSaveDraft').addEventListener('click', saveEditor);
$('#btnSaveEditor').addEventListener('click', publishArticle);
$('#btnClearDraft').addEventListener('click', clearLocalDraft);
$('#languageGrid').addEventListener('click', handleLanguageAction);
$('#btnReturnOriginal').addEventListener('click', returnToOriginal);
$('#btnRefreshLanguages').addEventListener('click', async () => {
  if (!await requireContent()) return;
  await loadLanguageWorkspace();
  setLog('🌐 IDIOMAS\n✔ Painel atualizado');
});

document.addEventListener('input', (event) => {
  if (event.target.matches('input[id], select[id], textarea[id]')) scheduleLocalDraft();
});
document.addEventListener('change', (event) => {
  if (event.target.matches('input[id], select[id], textarea[id]')) scheduleLocalDraft();
});
window.addEventListener('beforeunload', () => {
  if (atlasDraftDirty) saveLocalDraft();
});

$('#contentName').addEventListener('input', () => {
  updateDestinationFields();
  if (!$('#homeTitle').value.trim()) $('#homeTitle').value = $('#contentName').value;
});
$('#contentType').addEventListener('change', updateDestinationFields);
$('#contentSlug').addEventListener('input', () => {
  $('#contentSlug').dataset.manual = 'true';
  $('#contentSlug').value = slugify($('#contentSlug').value);
  updateDestinationFields();
});

const recoveredDraft = restoreLocalDraft();
updateDestinationFields();
refreshStatus();
if (recoveredDraft) setLog('Rascunho local recuperado. Continue de onde parou.');
