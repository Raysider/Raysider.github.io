class Todo {
  constructor() {
    this.tasks = [];
    this.term = "";
    this.listElement = document.getElementById("todo-list");
    this.editingTaskId = null;

    this.load();
    this.draw();
  }

  save() {
    localStorage.setItem("todo_tasks", JSON.stringify(this.tasks));
  }

  load() {
    try {
      const data = localStorage.getItem("todo_tasks");
      const parsed = data ? JSON.parse(data) : [];
      this.tasks = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      this.tasks = [];
    }
  }

  getFilteredTasks() {
    if (this.term.trim().length < 2) {
      return this.tasks;
    }
    const query = this.term.toLowerCase();
    return this.tasks.filter(task => task.text.toLowerCase().includes(query));
  }

  highlightText(text) {
    if (this.term.trim().length < 2) return text;
    const safeTerm = this.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${safeTerm})`, "gi");
    return text.replace(regex, "<mark class='highlight'>$1</mark>");
  }

  validate(text, date) {
    if (!text || text.trim().length < 3) {
      return "Tekst zadania musi mieć co najmniej 3 znaki!";
    }
    if (text.trim().length > 255) {
      return "Tekst zadania nie może przekraczać 255 znaków!";
    }
    if (date) {
      const selectedDate = new Date(date);
      if (selectedDate.getTime() <= Date.now()) {
        return "Termin zadania musi być datą w przyszłości!";
      }
    }
    return null;
  }

  add(text, date = "") {
    const error = this.validate(text, date);
    if (error) {
      alert(error);
      return false;
    }

    this.tasks.push({
      id: Date.now().toString(),
      text: text.trim(),
      date: date
    });

    this.save();
    this.draw();
    return true;
  }

  delete(id) {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.save();
    this.draw();
  }

  update(id, newText, newDate) {
    const error = this.validate(newText, newDate);
    if (error) {
      alert(error);
      this.editingTaskId = null;
      this.draw();
      return;
    }

    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.text = newText.trim();
      task.date = newDate;
      this.save();
    }
    this.editingTaskId = null;
    this.draw();
  }

  draw() {
    if (!this.listElement) return;
    this.listElement.innerHTML = "";
    const visibleTasks = this.getFilteredTasks();

    visibleTasks.forEach((task) => {
      const taskEl = document.createElement("li");
      taskEl.className = "task-item";

      if (this.editingTaskId === task.id) {
        const inputEdit = document.createElement("input");
        inputEdit.type = "text";
        inputEdit.className = "inline-edit-input";
        inputEdit.value = task.text;

        const dateEdit = document.createElement("input");
        dateEdit.type = "datetime-local";
        dateEdit.className = "inline-edit-input";
        dateEdit.value = task.date || "";

        const saveEdit = () => {
          this.update(task.id, inputEdit.value, dateEdit.value);
        };

        const handleBlur = () => {
          setTimeout(() => {
            if (!taskEl.contains(document.activeElement)) {
              saveEdit();
            }
          }, 150);
        };

        inputEdit.addEventListener("blur", handleBlur);
        dateEdit.addEventListener("blur", handleBlur);
        inputEdit.addEventListener("keydown", (e) => {
          if (e.key === "Enter") saveEdit();
        });

        taskEl.appendChild(inputEdit);
        taskEl.appendChild(dateEdit);

        setTimeout(() => inputEdit.focus(), 0);

      } else {
        const contentDiv = document.createElement("div");
        contentDiv.className = "task-content";

        const textSpan = document.createElement("span");
        textSpan.innerHTML = this.highlightText(task.text);

        const dateSpan = document.createElement("span");
        dateSpan.className = "task-date";
        dateSpan.textContent = task.date ? ` [${task.date.replace("T", " ")}]` : "";

        contentDiv.appendChild(textSpan);
        contentDiv.appendChild(dateSpan);

        contentDiv.addEventListener("click", () => {
          this.editingTaskId = task.id;
          this.draw();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.innerHTML = "🗑️"; // Emotka przygotowana przez Sztuczną Inteligencję
        deleteBtn.className = "delete-btn";
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.delete(task.id);
        });

        taskEl.appendChild(contentDiv);
        taskEl.appendChild(deleteBtn);
      }

      this.listElement.appendChild(taskEl);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.todo = new Todo();

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      document.todo.term = e.target.value;
      document.todo.draw();
    });
  }

  const addForm = document.getElementById("add-task-form");
  const textInput = document.getElementById("task-text-input");
  const dateInput = document.getElementById("task-date-input");

  if (addForm && textInput && dateInput) {
    addForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const success = document.todo.add(textInput.value, dateInput.value);
      if (success) {
        textInput.value = "";
        dateInput.value = "";
      }
    });
  }
});
