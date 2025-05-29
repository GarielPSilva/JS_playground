const todos = [
    {
        id: 1,
        description: "Learn a new thing",
        isCompleted: true,
    },
    {
        id: 2,
        description: "Studyin JavaScript",
        isCompleted: true,
    },
    {
        id: 3,
        description: "Play videogames",
        isCompleted: false,
    },
];

const todosJSON = JSON.stringify(todos);
const todosList = JSON.parse(todosJSON);
// sempre que mandar para um servidor/whenever you send to a server
console.log(todosList);
