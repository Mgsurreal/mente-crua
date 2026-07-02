document.querySelectorAll('.step').forEach((btn) => btn.addEventListener('click', () => gotoStep(btn.dataset.step)));
document.querySelectorAll('[data-next]').forEach((btn) => btn.addEventListener('click', () => gotoStep(btn.dataset.next)));

$('#btnProject').addEventListener('click', selectProjectRoot);
$('#btnPublishHome').addEventListener('click', publishHomeCard);
$('#btnCreateContent').addEventListener('click', createContent);
$('#btnOpenContent').addEventListener('click', openContent);
$('#btnAddImages').addEventListener('click', addImages);
$('#imageInput').addEventListener('change', handleImageInputChange);
$('#mediaLibrary').addEventListener('click', handleMediaClick);
$('#btnSaveEditor').addEventListener('click', publishArticle);

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

updateDestinationFields();
refreshStatus();
