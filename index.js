'use strict';

const INITIAL_TASKS = [
  'Review pending items',
  'Respond to messages',
  'Work on priority tasks',
  'Take a short break',
  'Do something active',
  'Watch something for fun',
];

const STORAGE_KEY = 'todoData';

const todoList = document.querySelector('.to-do__list');
const todoForm = document.querySelector('.to-do__form');
const todoInput = document.querySelector('.to-do__input');
const itemTemplate = document.querySelector('#to-do__item-template');


const emptyMessage = document.createElement('p');
emptyMessage.textContent = 'No tasks yet';
emptyMessage.style.textAlign = 'center';
emptyMessage.style.color = '#777';
emptyMessage.style.marginTop = '40px';


function normalizeTasks(value) {
  if (!Array.isArray(value)) return [];

  const tasks = [];
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    tasks.push(trimmed);
  }
  return tasks;
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...INITIAL_TASKS];

    const parsed = JSON.parse(raw);
    const tasks = normalizeTasks(parsed);

    return tasks.length ? tasks : [...INITIAL_TASKS];
  } catch (err) {
    return [...INITIAL_TASKS];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getRenderedTasks() {
  const textNodes = todoList.querySelectorAll('.to-do__item-text');
  const tasks = [];
  for (const node of textNodes) {
    tasks.push(node.textContent);
  }
  return tasks;
}

function syncStorageFromDom() {
  const domTasks = getRenderedTasks();
  const savedTasks = loadTasks();

  if (JSON.stringify(domTasks) !== JSON.stringify(savedTasks)) {
    saveTasks(domTasks);
  }
}

function toggleEmptyState() {
  const hasItems = todoList.querySelector('.to-do__item') !== null;

  if (!hasItems) {
    if (!emptyMessage.isConnected) {
      todoList.after(emptyMessage);
    }
    return;
  }

  emptyMessage.remove();
}

function createItem(text) {
  const node = itemTemplate.content.cloneNode(true);

  const item = node.querySelector('.to-do__item');
  const textNode = node.querySelector('.to-do__item-text');
  const deleteBtn = node.querySelector('.to-do__item-button_type_delete');
  const duplicateBtn = node.querySelector('.to-do__item-button_type_duplicate');
  const editBtn = node.querySelector('.to-do__item-button_type_edit');

  textNode.textContent = text;

  deleteBtn.addEventListener('click', () => {
    item.remove();
    syncStorageFromDom();
  });

  duplicateBtn.addEventListener('click', () => {
    const copyText = textNode.textContent;
    todoList.prepend(createItem(copyText));
    syncStorageFromDom();
  });

  editBtn.addEventListener('click', () => {
    textNode.setAttribute('contenteditable', 'true');
    textNode.focus();
  });

  textNode.addEventListener('blur', () => {
    textNode.setAttribute('contenteditable', 'false');

    syncStorageFromDom();
  });

  textNode.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      textNode.blur();
    }
  });

  return node;
}

function renderInitialTasks() {
  const tasks = loadTasks();

  for (const task of tasks) {
    todoList.append(createItem(task));
  }

}

function handleFormSubmit(evt) {
  evt.preventDefault();

  const value = todoInput.value.trim();

  if (!value) return;

  todoList.prepend(createItem(value));

  syncStorageFromDom();

  todoInput.value = '';
}

todoForm.addEventListener('submit', handleFormSubmit);

renderInitialTasks();