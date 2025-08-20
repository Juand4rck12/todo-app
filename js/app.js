const todoForm = document.querySelector("form");
const reminderForm = document.getElementById("reminder-form");
const todoInput = document.getElementById("todo-input");
const todoListUL = document.getElementById("todo-list");
const reminderModal = document.getElementById("reminder-modal");
const closeModalButton = reminderForm.querySelector("#close-modal-button");

let currentTodoIndex = null;
let allTodos = getTodos();
updateTodoList();

// reminderModal.addEventListener("close", () => {
//     currentTodoIndex = null;
//     console.log(currentTodoIndex);
// });

console.log("actual indextodo", currentTodoIndex);

todoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    addTodo();
})

closeModalButton.addEventListener("click", () => {
    reminderModal.close()
})

function addTodo() {
    const todoText = todoInput.value.trim();

    if (todoText.length > 0) {
        const todoObject = {
            text: todoText,
            completed: false,
            reminder: null
        }
        allTodos.push(todoObject);
        updateTodoList();
        saveTodos();
        todoInput.value = "";
    }
}

function updateTodoList() {
    todoListUL.innerHTML = "";
    allTodos.forEach((todo, todoIndex) => {
        todoItem = createTodoItem(todo, todoIndex);
        todoListUL.append(todoItem);
    })
}

function createTodoItem(todo, todoIndex) {
    const todoId = "todo-" + todoIndex;
    const todoLI = document.createElement("li");
    const todoText = todo.text;
    todoLI.className = "todo";
    todoLI.innerHTML = `
        <input type="checkbox" id="${todoId}">
                <label class="custom-checkbox" for="${todoId}">
                    <i class="fas fa-check"></i>
                </label>
                <label for="${todoId}" class="todo-text">
                    ${todoText}
                </label>
                <button class="notify-button">
                    <i class="fa-solid fa-bell"></i>
                </button>
                <button class="delete-button">
                    <i class="fas fa-trash"></i>
                </button>
    `
    const deleteButton = todoLI.querySelector(".delete-button");
    deleteButton.addEventListener("click", () => {
        deleteTodoItem(todoIndex);
    })
    const notifyButton = todoLI.querySelector(".notify-button");

    if (todo.reminder && new Date(todo.reminder) > new Date()) {
        notifyButton.classList.add("active")
    }

    notifyButton.addEventListener("click", () => {
        currentTodoIndex = todoIndex;
        console.log("Posicion de current todo index: ", currentTodoIndex);
        reminderModal.showModal();
    })
    const checkbox = todoLI.querySelector("input");
    checkbox.addEventListener("change", () => {
        allTodos[todoIndex].completed = checkbox.checked;
        saveTodos();
    })
    checkbox.checked = todo.completed;

    return todoLI;
}

function deleteTodoItem(todoIndex) {
    allTodos = allTodos.filter((_, i) => i !== todoIndex);
    saveTodos();
    updateTodoList();
}

// Guardado en localStorage
function saveTodos() {
    const todosJson = JSON.stringify(allTodos);
    localStorage.setItem("todos", todosJson);
}

function getTodos() {
    const todos = localStorage.getItem("todos") || "[]";
    return JSON.parse(todos);
}

reminderForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // 1. Obtener la fecha y hora del input
    const reminderTimeInput = document.getElementById("reminder-time");
    const reminderTime = new Date(reminderTimeInput.value);

    // 2. Verificar que sea una fecha válida y que haya una tarea seleccionada
    if (isNaN(reminderTime.getTime()) || currentTodoIndex === null) {
        alert("Por favor, selecciona una fecha y hora válidas!");
        return;
    }

    // 3. Pedir permiso para notificar
    Notification.requestPermission()
        .then(permission => {
            if (permission === "granted") {
                // Si el usuario acepta, se guarda la fecha en la tarea respectiva
                allTodos[currentTodoIndex].reminder = reminderTime.toISOString();
                saveTodos();

                // Se programa la notificación
                scheduleNotification(allTodos[currentTodoIndex]);

                // Se actualiza la lista para que se vea el cambio de color
                updateTodoList();

            } else {
                alert("No se podrán enviar notificaciones si no das permiso.");
            }
        });

    // 4. Se limpia y se cierra el modal
    reminderForm.reset();
    reminderModal.close();
    // currentTodoIndex = null;
});

function scheduleNotification(todo) {
    const reminderDate = new Date(todo.reminder);
    currentTodoIndex = todo.todoIndex
    const now = new Date();

    const delay = reminderDate.getTime() - now.getTime();

    // Si el delay ya paso no se hace nada
    if (delay <= 0) {
        return;
    }

    setTimeout(() => {
        const notification = new Notification("¡Recordatorio de Tarea!", {
            body: todo.text,
            icon: "/assets/task-done-svgrepo-com.png"
        });
    }, delay);
}