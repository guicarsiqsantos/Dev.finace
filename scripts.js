const modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

const Storge = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transaction")) || [];
  },

  set(transaction) {
    localStorage.setItem(
      "dev.finances:transaction",
      JSON.stringify(transaction)
    );
  },
};

const Transaction = {
  all: Storge.get(),

  add(transaction) {
    Transaction.all.push(transaction);

    app.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    app.reload();
  },

  incomes() {
    let income = 0;
    Transaction.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });
    return income;
  },
  expenses() {
    let expense = 0;
    Transaction.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });
    return expense;
  },
  total() {
    return Transaction.incomes() + Transaction.expenses();
  },
};

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(Transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(Transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <th>
          <img class="buttonDelete" onclick="Transaction.remove(${index})" src="/assets/minus.svg" alt="Remover transação" />
       </th>
    `;
    return html;
  },

  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransaction() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100;

    return value;
  },

  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },
};

const form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: form.description.value,
      amount: form.amount.value,
      date: form.date.value,
    };
  },
  validateField() {
    const { description, amount, date } = form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor preencha todos os campos.");
    }
  },

  formatValues() {
    let { description, amount, date } = form.getValues();

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  clearFields() {
    form.description.value = "";
    form.amount.value = "";
    form.date.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {
      form.validateField();
      const transaction = form.formatValues();
      Transaction.add(transaction);
      form.clearFields();
      modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const app = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);

    DOM.updateBalance();

    Storge.set(Transaction.all);
  },
  reload() {
    DOM.clearTransaction();
    app.init();
  },
};

app.init();

// Vetor e array
// transactions.map(item => DOM.addTransaction(item))

// transactions.forEach((item) => {
//   DOM.addTransaction(item);
// });

// for (let index = 0; index < transactions.length; index++) {
//   const element = transactions[index];
//   DOM.addTransaction(element)
// }
