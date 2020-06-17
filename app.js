
// Budjet controller
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function (curr) {
            sum += curr.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0.
        },

        budget : 0,

        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, id;
            // create new id
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }


            if (type === "exp") {
                newItem = new Expense(id, des, val);

            } else if (type === "inc") {
                newItem = new Income(id, des, val);
            }
            // add new item into data structure
            data.allItems[type].push(newItem);

            return newItem;
        },

        calculateBudget :  function () {
            
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate budjet
            data.budget = data.totals.inc - data.totals.exp; 
            //calculate the percent of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        }
    };

})();


//  UI Controller
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        expensePercentage: '.budget__expenses--percentage',
        container: ".container clearfix"

    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either 'inc' or 'exp'.
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };


        },

        addListItem: function (obj, type) {
            var html, newHtml;
            //create HTML String with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div>' +
                    '<div class="right clearfix"> <div class="item__value">%value%</div>' +
                    '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">' +
                    '</i></button> </div></div></div>';

            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div>' +
                    '<div class="item__percentage">21%</div> <div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div></div></div>';

            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert the Html into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        clearFileds: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        getDOMstrings: function () {
            return DOMstrings;
        },

        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.expensePercentage).textContent = obj.percentage = "%";
            } else {
                document.querySelector(DOMstrings.expensePercentage).textContent = "---";
            }
            

        }
    };
})();


//  Global App controller
var controller = (function (bdjtCtrl, uiCtrl) {

    var setupEventListeners = function () {

        var DOM = uiCtrl.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {

                ctrlAddItem();

            }

        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    };

    var updateBudget = function() {
    //1) calculate the budjet
    bdjtCtrl.calculateBudget();

    //2) return the budjet
    var budget = bdjtCtrl.getBudget();

    //3) Display the budjet on UI
    uiCtrl.displayBudget(budget);
};

    var ctrlAddItem = function () {

    //1) Get the field input data
    var input = uiCtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
        //2) add item to the budjet controller
        var newItem = bdjtCtrl.addItem(input.type, input.description, input.value);
        // 3) add new item to user interface

        uiCtrl.addListItem(newItem, input.type);

        //4)  clear fields
        uiCtrl.clearFileds();

        //5) calculate and update budjet
        updateBudget();
    }



};

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        splitID = itemID.split('-');
        type = splitID[0];
        ID =splitID[1];

        // 1) delete the item from the data structure

        // 2) delete the item from the UIController

        // 3) update and show the new Budget

    };

return {
    init: function () {
        //console.log("Application has started");
        uiCtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: 0
        });
        setupEventListeners();
    }
};



}) (budgetController, UIController);


controller.init();


//controller.anotherPublic();