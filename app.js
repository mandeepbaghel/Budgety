//---------------------------------------DATA CONTROLLER-----------------------------------------------//
var budgetController = (function() {
  //function constructor of expense
  var Expense = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalInc) {
    if (totalInc > 0) {
      this.percentage = Math.round((this.value / totalInc) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  //function constructor of income
  var Income = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
  };
  //function to calculate total of income/expense
  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(current) {
      sum += current.value;
    });
    data.totals[type] = sum;
  };
  //data structures for our app
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };
  //public functions for busget controller
  return {
    //add income/expense object to data structure
    addItems: function(type, desc, value) {
      var newItem, id;
      //generate id for new item
      if (data.allItems[type].length > 0) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        id = 0;
      }
      //creating new item object based on the type
      if (type === "exp") {
        newItem = new Expense(id, desc, value);
      } else if (type === "inc") {
        newItem = new Income(id, desc, value);
      }
      //adding this new item to their respective array based on their type
      data.allItems[type].push(newItem);
      return newItem;
    },
    //remove an object from the data structure
    deleteItems: function(type, id) {
      var ids, index;
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      //1. calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      //2. calcuate total budget
      data.budget = data.totals.inc - data.totals.exp;

      //calculate budget percentage
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentage: function() {
      //calculate percentage for all expenses objects in the expense array
      data.allItems.exp.forEach(function(current){
        current.calcPercentage(data.totals.inc);
      });
    },
     //get all the percentages in the expense array
     getPercentages: function(){
        var percentages = data.allItems.exp.map(function(current){
          return current.getPercentage();
        });
        return percentages;
    },

    testing: function() {
      return data;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        inc: data.totals.inc,
        exp: data.totals.exp,
        percentage: data.percentage
      };
    }
  };
})();

//---------------------------------------UI CONTROLLER-----------------------------------------------//
var UIController = (function() {
  var DOMStrings = {
    inputType: ".add__type",
    inputDesc: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    expensesList: ".expenses__list",
    incomeList: ".income__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    expPerLabel :".item__percentage",
    dateLabel :".budget__title--month",
    container: ".container"
  };
var formatNumber = function(num, type){
var int, dec, numArr;
  //add two decimal points in number
  num=Math.abs(num);
  num=num.toFixed(2);
  //add a , if number is greater than 1000 24000
  numArr = num.split(".");
  int = numArr[0];
  dec = numArr[1];
  if(int.length > 3){
    int = int.substr(0,int.length - 3) + "," + int.substr(int.length - 3 , 3);
  }
    //add +/- sign based on inc/exp
  num = (type === "exp" ? '-':'+') + ' ' + int + "." + dec;
  return num; 
}
function nodeListforEach(list,callback){
  for(i=0;i<list.length;i++){
    callback(list[i],i);
  }
};
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value, //either exp or inc
        desc: document.querySelector(DOMStrings.inputDesc).value, //get item description
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value) //get the item value
      };
    },
    getDate: function(){
      var date,month,year;
      date = new Date;
      month = date.getMonth();
      year = date.getFullYear();
      months=['January', 'Feburary','March','April','May','June','July','August','September','October','November','December']
      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ", " + year;
    },
    setFocus: function(){
      document.querySelector(DOMStrings.inputDesc).focus();
    },
    addListItem: function(obj, type) {
      var html, newHtml, element;
      
      //create an HTML string with placeholder text
      if (type === "inc") {
        element = DOMStrings.incomeList;
        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%desc%</div> <div class="right clearfix">  <div class="item__value"> %value%</div> <div class="item__delete">  <button class="item__delete--btn"><i class="fa fa-times-circle"></i></button> </div> </div></div>';
      } else {
        element = DOMStrings.expensesList;
        html =
          '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%desc%</div> <div class="right clearfix"> <div class="item__value"> %value%</div> <div class="item__percentage">10%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="fa fa-times-circle"></i></button>  </div>  </div> </div>';
      }

      //replace the placeholder text with actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%desc%", obj.desc);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value,type));

      //insert the HTML in the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItems: function(id) {
      var el = document.getElementById(id);
      el.parentNode.removeChild(el);
    },

    clearInputFields: function() {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMStrings.inputDesc + ", " + DOMStrings.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(current) {
        current.value = "";
        fieldsArr[0].focus();
      });
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.inc,'inc');
      document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.exp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },
    displayPercenatges: function(percentages){
      var fields = document.querySelectorAll(DOMStrings.expPerLabel);
     
      nodeListforEach(fields,function(current,index){
        if(percentages[index] > 0){
          current.textContent = percentages[index] + " %";
        } else{
          current.textContent = "---";
        } 
      });
    },
    changeType : function(){
      fields = document.querySelectorAll(DOMStrings.inputValue +',' + DOMStrings.inputDesc+','+DOMStrings.inputType);
      nodeListforEach(fields, function(current){
        current.classList.toggle('red-focus');
      });
      document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

    },
    getDOMStrings: function() {
      return DOMStrings;
    }
  };
})();

//---------------------------------------APP CONTROLLER-----------------------------------------------//
var appController = (function(budgetCtrl, UICtrl) {
  //FUNCTION TO GET ALL EVENT LISTNERS
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode == 13 || event.which == 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
      document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType);
      document.querySelector(DOM.inputType).addEventListener('change',UICtrl.setFocus);
  };

  function updateBudget() {
    //1.calculate the budget
    budgetCtrl.calculateBudget();
    //2.return the budget
    var budget = budgetCtrl.getBudget();
    //3.update budget in the UI
    UICtrl.displayBudget(budget);
  }

  function updatePercentage() {
    //1. calculate the percentages
    budgetCtrl.calculatePercentage();
    //2. return the percentage
    expPerArray = budgetCtrl.getPercentages();
    //3. update percentage in UI
    UICtrl.displayPercenatges(expPerArray);
  }

  //FUNCTION FOR GETTING VALUES FROM DOM AND UPDATING THE DOM
  function ctrlAddItem() {
    var inputValues, newItem;

    //1. get the value from input field
    inputValues = UICtrl.getInput(); //CALLING getInput FROM UI CONTROLLER TO GET DATA

    if (
      inputValues.desc !== "" &&
      !isNaN(inputValues.value) &&
      inputValues.value != 0
    ) {
      //2. add the item to budget controller
      newItem = budgetCtrl.addItems(
        inputValues.type,
        inputValues.desc,
        inputValues.value
      );

      //3. add the item to the UI
      UICtrl.addListItem(newItem, inputValues.type);

      //4 clearing input fields
      UICtrl.clearInputFields();

      //5. calculate and update the total budget
      updateBudget();

      //6. calculate and update percentage
      updatePercentage();
    } else {
      console.log("fill the fields with valid values");
    }
  }

  var ctrlDeleteItem = function(event) {
    var itemID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      idNumber = parseInt(splitID[1]);

      //1. delete the item from data structure
      budgetCtrl.deleteItems(type, idNumber);

      //2. delete item from DOM
      UICtrl.deleteListItems(itemID);

      //3. update and show the budget
      updateBudget();

      //4. update and show percentage
      updatePercentage();
    }
  };

  return {
    init: function() {
      console.log("Application has started");
      UICtrl.displayBudget({
        budget: 0,
        inc: 0,
        exp: 0,
        percentage: -1
      });
      UICtrl.getDate();
      UICtrl.setFocus();
      return setupEventListeners();
    }
  };
})(budgetController, UIController);

appController.init();
