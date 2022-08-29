'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2021-11-18T21:31:17.178Z',
    '2021-12-23T07:42:02.383Z',
    '2022-01-28T09:15:04.904Z',
    '2022-04-01T10:17:24.185Z',
    '2022-05-08T14:11:59.604Z',
    '2022-05-27T17:01:17.194Z',
    '2022-08-24T00:00:00.929Z',
    '2022-08-28T05:38:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2021-11-01T13:15:33.035Z',
    '2021-11-30T09:48:16.867Z',
    '2021-12-25T06:04:23.907Z',
    '2022-01-25T14:18:46.235Z',
    '2022-02-05T16:33:06.386Z',
    '2022-04-10T14:43:26.374Z',
    '2022-06-25T18:49:59.371Z',
    '2022-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const formatMovementDate = function (i) {
  const date = new Date(this.movementsDates[i]);

  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(Date.now(), date);

  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // return `As of ${`${date.getDate()}`.padStart(2, '0')}/${`${
  //   date.getMonth() + 1
  // }`.padStart(2, '0')}/${date.getFullYear()}`;

  return new Intl.DateTimeFormat(this.locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  const { movements, locale, currency } = acc;
  containerMovements.replaceChildren(); // removes existing children, also we could add elements if we want that

  // while (containerMovements.firstChild) {
  //   containerMovements.removeChild(containerMovements.lastChild);
  // }

  // containerMovements.textContent = ''; // .textContent is more efficient than .innerText and .innerHTML

  // sort
  const movs = sort ? [...movements].sort((a, b) => a - b) : movements; // SOLVE ascending because, it will be reversed by the end, so basically we were inserting all the elements at the start of the container, that's why

  movs.forEach((move, i) => {
    // https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript?noredirect=1&lq=1
    // https://stackoverflow.com/questions/4991098/replacing-all-children-of-an-htmlelement
    const type = move > 0 ? `deposit` : `withdrawal`;

    const formattedMov = formatCur(move, locale, currency);

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">
            ${i + 1} ${type}
           </div>
          <div class="movements__date">${formatMovementDate.call(acc, i)}</div>
          <div class="movements__value">${formattedMov}</div>
        </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html); // SOLVE the afterbegin(unshift) keyword reverses the order, in case im not familiar, so to save the order we might use the beforeend(push) keyword in the first argument
  });
};

const calcDisplayBalance = function (acc) {
  // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
  // Object.defineProperty
  acc.balance = acc.movements.reduce((acc, currentValue) => acc + currentValue);
  // while (labelBalance.firstChild) {
  //   labelBalance.removeChild(labelBalance.lastChild);
  // }

  labelBalance.textContent = `${formatCur(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

const calcDisplaySummary = function ({
  movements,
  interestRate,
  locale,
  currency,
}) {
  const incomes = movements
    .filter(mov => mov > 0)
    .reduce((deposit, mov) => deposit + mov, 0)
    .toFixed(2);

  labelSumIn.textContent = `${formatCur(incomes, locale, currency)}`;

  const outcomes = Math.abs(
    movements
      .filter(mov => mov < 0)
      .reduce((acc, mov) => acc + mov, 0)
      .toFixed(2)
  );

  labelSumOut.textContent = `${formatCur(outcomes, locale, currency)}`;

  const interest = movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0)
    .toFixed(2);

  labelSumInterest.textContent = `${formatCur(interest, locale, currency)}`;
};

// each function should actually receive the data that it should work with, instead of using a global variable
const createUsernames = function (accs) {
  // there is a side effect, so in other words, to simply do some work without returning anything
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsernames(accounts);

const clearFields = function (input1, input2) {
  if (input1) {
    input1.value = '';
  }

  if (input2) {
    input2.value = '';
  }

  input1?.blur();
  input2?.blur();

  // there is also focus method, which do opposite of the blur method
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event
};

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

let currentAccount;

// Event Handler
btnLogin.addEventListener('click', e => {
  e.preventDefault();

  let account;

  if (
    (account = accounts.find(
      acc =>
        acc.username === inputLoginUsername.value &&
        acc.pin === +inputLoginPin.value
    ))
  ) {
    sorted = false;
    currentAccount = account;

    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }!`;
    containerApp.style.opacity = 1;
    containerApp.style.visibility = 'visible';

    // http://www.lingoes.net/en/translator/langcode.htm
    // Experimenting with API
    const now = new Date();
    // 2-digit, numeric, long, short, narrow
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };

    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    /*
      // // getMonth() - is zeroBased
      // // getDay() - also zeroBased, sunday is zero
    */

    updateUI(currentAccount);
    clearFields(inputLoginUsername, inputLoginPin);
  }

  console.log(account);
});

btnTransfer.addEventListener('click', e => {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    receiverAcc &&
    amount > 0 &&
    amount <= currentAccount.balance &&
    receiverAcc !== currentAccount
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    // in real world application, we would probably have an object for each movement and so that object would then contain the amount, the date and some other information about the movement
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
    clearFields(inputTransferAmount, inputTransferTo);
  } else {
    console.log(
      'not enough money to transfer or selftransfer attempt or transferTo input is incorrect or empty'
    );
  }

  console.log(amount, receiverAcc);
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  // at least one of the elements in the movements array has this condition
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // add movement
    currentAccount.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
    clearFields(inputLoanAmount);
  } else {
    console.log(
      'amount is below zero or there is no deposit that is greater than 10% of requested amount'
    );
  }
});

btnClose.addEventListener('click', e => {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    // delete account
    accounts.splice(
      accounts.findIndex(acc => acc === currentAccount),
      1
    );

    // HIDE UI
    containerApp.style.opacity = 0;
    containerApp.style.visibility = 'hidden';

    // clear fields
    clearFields(inputCloseUsername, inputClosePin);

    // reset welcome
    labelWelcome.textContent = 'Log in to get started';
  } else {
    console.log('incorrect input');
  }
});

let sorted = false;

btnSort.addEventListener('click', e => {
  e.preventDefault();

  displayMovements(currentAccount, (sorted = !sorted));
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
////////////////////////////////////////////////////
// Converting and Checking Numbers

// numbers represented internally in JavaScript as a floating point numbers, basically always as decimals
console.log(23 === 23.0);

// Base 10 - 0 to 9. 1/10 = 0.1  3/10 = 3.333333333
// Binary base 2 - 0 to 1

console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

// Conversion
console.log(Number('23'));
console.log(+'23'); // it will do type coercion

// Parsing
console.log(Number.parseInt('30px', 10)); // Number object which is kind of this function, but it's also an object in the end, because every function is also an object
console.log(Number.parseInt('e23', 10)); // NaN

console.log(Number.parseInt('2.5rem'));
console.log(Number.parseFloat('2.5rem'));

// console.log(parseFloat('2.5rem')); old school way of writing

// Check if value is NaN
console.log(Number.isNaN(20)); // false
console.log(Number.isNaN('20')); // false
console.log(Number.isNaN(+'20X')); // true
console.log(Number.isNaN(23 / 0)); // Infinity, which is false

// Checking if value is a number, not a string
console.log(Number.isFinite(20)); // true
console.log(Number.isFinite('20')); // false
console.log(Number.isFinite('20x')); // false
console.log(Number.isFinite(+'20X')); // NaN, which is false
console.log(Number.isFinite(Infinity)); // false
console.log(Number.isFinite(23 / 0)); // Infinity, which is false

// ???
console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23 / 0)); // Infinity
*/

/*
//////////////////////////////////////////////////////
// Math and Rounding

// sqrt
console.log(Math.sqrt(25)); // square root, 5
console.log(25 ** (1 / 2)); // 5
console.log(8 ** (1 / 3)); // 2

// max
console.log(Math.max(5, 18, 23, 11, 2));
console.log(Math.max(5, 18, '23', 11, 2)); // still give us 23, it will do type coercion
console.log(Math.max(5, 18, '23px', 11, 2)); // it doesn't parsing, NaN

// min
console.log(Math.min(5, 18, 23, 11, 2));

// finding circle
console.log(Math.PI * Number.parseFloat('10px') ** 2);

// random
console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
// 0...1 -> 0...(max - min) -> min...(max - min + min) -> min...max

// Rounding integers
console.log(Math.trunc(23.3)); // simply removes any decimal part always

// round(round to the nearest integer)
console.log(Math.round(23.3)); // 23
console.log(Math.round(23.9)); // 24

// ceil(round up)
console.log(Math.ceil(23.3)); // 24
console.log(Math.ceil(23.9)); // 24

// floor(round down)
console.log(Math.floor(23.3)); // 23
console.log(Math.floor(23.9)); // 23

console.log(Math.trunc(23.3)); // 23

// subtle difference
console.log(Math.trunc(-23.3)); // -23
console.log(Math.floor(-23.3)); // -24

// Rounding decimals
console.log((2.7).toFixed(0)); // result is 3(string), this is a number, so it's a primitive and primitive actually don't have methods, and so behind the scenes, JavaScript will do boxing and boxing is to basically transform this to a number object, then call the method on that object and then once the operation is finished it will convert it back to a primitive
console.log((2.7).toFixed(3)); // 2.700 it's a string
console.log((2.345).toFixed(2)); // 2.35 it's a string
console.log(+(2.345).toFixed(2)); // 2.35 it's a number
*/

/*
///////////////////////////////////////////////////
// The Remainder Operator

console.log(5 % 2); // 1
console.log(5 / 2); // 5 = 2 * 2 + 1

console.log(8 % 3); // 2
console.log(8 / 3); // 8 = 2 * 3 + 2

console.log(6 % 2 !== 1); // true
console.log(7 % 2 !== 1); // false

const isEven = n => n % 2 === 0;

console.log(isEven(3));

const rowsFrom = Array.from(
  document.querySelectorAll('.movements__row'),
  (el, i, arr) => {
    console.log(el, i, arr); // arr is undefined
  }
);

console.log(rowsFrom); // [undefined, undefined], because of the mapping function

// nth time
labelBalance.addEventListener('click', () => {
  [...document.querySelectorAll('.movements__row')].forEach((row, i) => {
    if ((i + 1) % 2 === 0) row.style.backgroundColor = 'orangered';
    if ((i + 1) % 3 === 0) row.style.backgroundColor = 'yellow';
  });
});
*/

/*
///////////////////////////////////////////////////////
// Numeric Separators

// 287,460,000,000
const diameter = 287_460_000_000;
console.log(diameter);

const price = 345_99;
console.log(price);

const transferFee1 = 15_00;
const transferFee2 = 1_500;

const PI = 3.1415;
console.log(PI);

console.log(Number('230_000')); // NaN
console.log(parseInt('230_000')); // 230
*/

/*
//////////////////////////////////////////////////////
// Working with BigInt
console.log(2 ** 53 - 1); // 2 - because base 2, only zeros and ones
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1); // not accurate
console.log(2 ** 53 + 2); // not accurate
console.log(2 ** 53 + 3); // not accurate
console.log(2 ** 53 + 4); // not accurate

console.log(482934732897432987492874892748274n);
// console.log(BigInt(482934732897432987492874892748274)); // bad practice with large numbers

// Operations
console.log(10000n + 10000n);
console.log(123712893712837128371n * 1000000000000n);
// console.log(Math.sqrt(16n)); // cannot convert a bigint value to a number

// Exceptions
const huge = 1234719847128471n;
const num = 23;
console.log(huge * BigInt(num)); // we must explicitly convert Number to BigInt to do such operations

console.log(20n > 15); // works as expected
console.log(20n === 20); // doesn't do type coercion, so false is returned
console.log(typeof 20n);
console.log(20n == '20'); // type coercion, true

console.log(huge + 'is REALLY big!!'); // converted a big int to a string successfully

// Divisions
console.log(11n / 3n); // it will cut off the decimal part
console.log(10 / 3);
*/

/*
///////////////////////////////////////////////////////
// Creating Dates

// 4 ways of creating dates in JavaScript
const now = new Date();
console.log(now);

const parseStringToDate = new Date('Aug 28 2022 12:11:42');
console.log(parseStringToDate);
console.log(new Date('16 December, 2015')); // it's generally not a good idea to do this because it can be quite unreliable
console.log(new Date(account1.movementsDates[0])); // Z means the UTC(Universal Coordinated Time)

console.log(new Date(2037, 10, 19, 15, 23, 5));
console.log(new Date(2037, 10, 30));

console.log(new Date(0)); // Unit time which is January 1st, 1970
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // 3 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
// 3 * 24 * 60 * 60 * 1000 = 259200000 is a timestamp
*/

/*
// Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear()); // never use getYear
console.log(future.getMonth()); // this one is zero based
console.log(future.getDate()); // number of the day
console.log(future.getDay()); // day of the week, zero is Sunday => zero based 0..6
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());
console.log(future.getTime());

console.log(new Date(future.getTime()));

console.log(new Date(Date.now()));
// Date.now() and Date.parse() are timestamps

// (Date.now() - (Date.now() - (24 * 60 * 60 * 1000))) / (1000 * 60 * 60 * 24) -> so basically we computed today's day - yesterday's day and have been got back that with milliseconds which was essentailly converted to 1 day by formula t / 1000 / 60 / 60 / 24 or  t / (1000 * 60 * 60 * 24)

// days - t / (1000 * 60 * 60 * 24)
// hours - t / (1000 * 60 * 60) % 24
// minutes - t / (1000 * 60) % 60
// seconds - t / (1000) %  60

// set verions
future.setFullYear(2040);
console.log(future);
*/

/*
//////////////////////////////////////////////////////////////////
// Operations With Dates

const future = new Date(2037, 10, 19, 15, 23);
console.log(+future - Date.now());

const calcDaysPassed = (date1, date2) =>
  Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24)); // 24 hours in a day, there are 60 minutes in one hour, 60 seconds in one minute and 1000 milliseconds in one second

const days1 = calcDaysPassed(
  new Date(2037, 3, 14),
  new Date(2037, 3, 24, 10, 8)
);
console.log(days1);

// moment.js for precise calculations for example, including time changes due to daylight saving changes and other weird edge cases
*/

/*
////////////////////////////////////////////////////////////////////
// Internationalizing Numbers (Intl)

const num = 2213233412.23;

// unit: mile-per-hour, celsius
// style: unit, percent, currency
const options = {
  style: 'currency',
  unit: 'celsius',
  currency: 'EUR',
  // useGrouping: false, // without separators
};

console.log('US: ', new Intl.NumberFormat('en-US', options).format(num));
console.log('Germany: ', new Intl.NumberFormat('de-DE', options).format(num));
console.log('Syria: ', new Intl.NumberFormat('ar-SY', options).format(num));
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language, options).format(num)
);
*/

//////////////////////////////////////////////////////////////////////////
// Timers _setTimeout and setInterval

const ingredients = ['olives', 'spinach'];

setTimeout(
  (ing1, ing2) =>
    console.log(`Here is your pizza! Some ingredients: ${ing1}, ${ing2};`),
  3000,
  ...ingredients
);

console.log('Waiting...');
