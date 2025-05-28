const person = {
    firstName: "Gabriel",
    lastName: "Peres",
    age: 19,
    hobbies: ['Play videogames','play volleyball']
};

//const firstName = person.firstName;
//const lastName = person.lastName;
//const age = person.age;
//const hobbies = person.hobbies;
// ---------//---------

const { firstName, lastName, age, hobbies } = person;
//same thing

const volley = person.hobbies[2]
console.log(firstName);
console.log(lastName);
console.log(age);
console.log(hobbies);
console.log(volley);