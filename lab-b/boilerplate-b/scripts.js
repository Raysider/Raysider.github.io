class Todo {
    constructor() {
        this.tasks = [];
        this.term = "";
        this.listElement = document.getElementById("todo-list");
        this.load();
        this.draw();
    }

    this.listElement.innerHTML = "";
    const visibleTasks = this.getFilteredTasks();

    visibleTasks.forEach((task, index) => {
        const taskEl = document.createElement("div");
        li.textContent = task;
}
