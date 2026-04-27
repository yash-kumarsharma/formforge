document.getElementById('publicForm').addEventListener('submit', e => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const answers = {};
  formData.forEach((value, key) => {
    if(answers[key]) {
      answers[key] = [].concat(answers[key], value);
    } else {
      answers[key] = value;
    }
  });

  fetch(`/api/responses/${formId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers })
  }).then(() => alert('Response submitted!'));
});
