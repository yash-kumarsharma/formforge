const socket = io();
const formId = document.body.dataset.formId;

socket.emit('join-form', formId);

socket.on('question:added', q => {
  const container = document.getElementById('questions');
  const div = document.createElement('div');
  div.className = 'bg-white p-4 rounded shadow';
  div.innerHTML = `<label class="block font-medium mb-2">${q.label}</label>`;
  container.appendChild(div);
});

document.getElementById('add-question').addEventListener('click', () => {
  const questionText = prompt("Enter question text");
  if(!questionText) return;

  fetch(`/api/questions/${formId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: questionText, type: 'TEXT', order: 0 })
  }).then(res => res.json()).then(q => {
    socket.emit('question:added', q);
  });
});
