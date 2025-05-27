const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const numberMultipliedBySeven = numbers.map(function (number) {
    return number * 7;
});

const ages = [13, 32, 45, 19, 10];

const sumOfAges = ages.reduce(function(age, accumulator) {
    return accumulator + age;
}, 0)

console.log(sumOfAges);