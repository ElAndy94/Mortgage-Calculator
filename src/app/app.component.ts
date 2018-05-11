import { Component } from '@angular/core';
import { FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { OnInit } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.componentupdate.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'app';
  myform: FormGroup; //My Form
  offers: Mortgages[];
  optionA: Mortgages; //each offer
  optionB: Mortgages;
  optionC: Mortgages;
  optionD: Mortgages;
  optionE: Mortgages;
  interestI: number; //Where i store the online rates

  customer: Customer = {
    lastname: '',
    email: '',
    phoneNumber: '',
    deposit: 0,
    length: null,
    annualSalary: 0,
    borrow: 0,
    bank: null,
    messages: ''
  };



  constructor(private fb: FormBuilder, private http: HttpClient) { // <--- inject FormBuilder
    this.createForm();
    this.http.get('https://www.quandl.com/api/v3/datasets/BOE/IUDBEDR.json?rows=1&api_key=-h3fmJksb7dbFcxrEpgU').subscribe(data => { //This gets the information from that link with my special API key
      this.interestI = data['dataset']['data'][0][1]; //Directs where the interest rate is that it wants to grab, and on the link also modfied it to retrive the first row=1.
      this.interestI /= 100; //deviding the interest rate from online by 100 to get the real %
    },
      err => {  //if error occurs then it sets the interest to 0.003
        this.interestI = 0.003;
        console.log(err);
      }
    );
  }

  createForm() { //This is where all my validation is done, pretty straight forward.
    this.myform = this.fb.group({
      lastname: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(22),
        Validators.pattern(/^[a-z]|[A-Z]|[a-z]'[a-z]|[a-z]+-[a-z]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      phoneNumber: ['', [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(13),
        Validators.pattern(/^(((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/)
      ]],
      deposit: ['', [
        Validators.required,
        Validators.maxLength(13),
        Validators.pattern(/^[1-9]\d*(\.\d+)?$/)
      ]],
      annualSalary: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(13),
        Validators.pattern(/^[1-9]\d*(\.\d+)?$/)
      ]],
      borrowAmount: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(13),
        Validators.pattern(/^[1-9]\d*(\.\d+)?$/)
      ]],
      loanDuration: ['', Validators.required],
      account: ['', Validators.required]
    });
  }


  mortgageOffers() {   //this is where all my mortgages offers are calculated and pushed.
    this.offers = [];

    //Option A
    var maxAmountA = 4 * this.customer.annualSalary; //Calculates the max amount that can be offered for optionA 4* their salary in OptionA changes for each option.
    if (this.customer.borrow < maxAmountA) { //if they dont pass the max amount then it will go through
      if (this.customer.deposit >= 0 && this.customer.length != 30) { //these checks required to pass through optionA
        this.optionA = new Mortgages();
        this.offers.push(this.optionA); //pushes the offer into optionA
        this.optionA.interestRate = (Number(0.008) + (Number(this.interestI))); //Base interest from internet added with the optionA interest
        this.optionA.mortgageLength = this.customer.length;
        this.optionA.amountBorrowed = this.customer.borrow;
        this.optionA.offerNumber = 'A';
        this.optionA.amountRepayable = Number(this.optionA.amountBorrowed) + (Number(this.optionA.amountBorrowed) * Number(this.optionA.interestRate));
        this.optionA.monthlyRepayments = (this.optionA.amountRepayable / (this.customer.length * 12)); //devides and mutiplies by 12 to find out the price monthly.
      }
    }

    //option B
    var maxAmountB = 4.1 * this.customer.annualSalary;
    if (this.customer.borrow < maxAmountB) {
      if (this.customer.deposit >= 0 && this.customer.length != 30 && Number(this.customer.bank) == 1) {
        this.optionB = new Mortgages();
        this.offers.push(this.optionB);
        this.optionB.interestRate = 0.007 + this.interestI;
        this.optionB.mortgageLength = this.customer.length;
        this.optionB.amountBorrowed = this.customer.borrow;
        this.optionB.offerNumber = 'B';
        this.optionB.amountRepayable = Number(this.optionB.amountBorrowed) + (Number(this.optionB.amountBorrowed) * Number(this.optionB.interestRate));
        this.optionB.monthlyRepayments = (this.optionB.amountRepayable / (this.customer.length * 12));
      }
    }

    //option C
    var maxAmountC = 5 * (Number(this.customer.deposit) + Number(this.customer.annualSalary));
    if (this.customer.borrow < maxAmountC) {
      if (this.customer.deposit >= 10000 && this.customer.length != 10 && this.customer.length != 30) {
        this.optionC = new Mortgages();
        this.offers.push(this.optionC);
        this.optionC.interestRate = 0.006 + this.interestI;
        this.optionC.mortgageLength = this.customer.length;
        this.optionC.amountBorrowed = this.customer.borrow;
        this.optionC.offerNumber = 'C';
        this.optionC.amountRepayable = Number(this.optionC.amountBorrowed) + (Number(this.optionC.amountBorrowed) * Number(this.optionC.interestRate));
        this.optionC.monthlyRepayments = (this.optionC.amountRepayable / (this.customer.length * 12));
      }
    }

    //option D
    var maxAmountD = 6 * (Number(this.customer.deposit) + Number(this.customer.annualSalary));
    if (this.customer.borrow < maxAmountD) {
      if (this.customer.deposit >= 20000 && this.customer.length != 20) {
        this.optionD = new Mortgages();
        this.offers.push(this.optionD);
        this.optionD.interestRate = 0.004 + this.interestI;
        this.optionD.mortgageLength = this.customer.length;
        this.optionD.amountBorrowed = this.customer.borrow;
        this.optionD.offerNumber = 'D';
        this.optionD.amountRepayable = Number(this.optionD.amountBorrowed) + (Number(this.optionD.amountBorrowed) * Number(this.optionD.interestRate));
        this.optionD.monthlyRepayments = (this.optionD.amountRepayable / (this.customer.length * 12));
      }
    }

    //option E
    var maxAmountE = 7 * (Number(this.customer.deposit) + Number(this.customer.annualSalary));
    if (this.customer.borrow < maxAmountE) {
      if (this.customer.deposit >= 40000 && this.customer.length != 30 && Number(this.customer.bank) == 1) {
        this.optionE = new Mortgages();
        this.offers.push(this.optionE);
        this.optionE.interestRate = 0.002 + this.interestI;
        this.optionE.mortgageLength = this.customer.length;
        this.optionE.amountBorrowed = this.customer.borrow;
        this.optionE.offerNumber = 'E';
        this.optionE.amountRepayable = Number(this.optionE.amountBorrowed) + (Number(this.optionE.amountBorrowed) * Number(this.optionE.interestRate));
        this.optionE.monthlyRepayments = (this.optionE.amountRepayable / (this.customer.length * 12));
      }
    }
    if (this.customer.bank == false) { //if customer bank = false then it hands out a message to help the client get the best possible offer.
      this.customer.messages = ("If you create an Account with us you will benefit from better rates!");
    }
    else {
      this.customer.messages = ('');
    }

    this.offers.reverse(); //reverses my offers

  }

}

export class Customer {
  lastname: string;
  email: string;
  phoneNumber: string;
  deposit: number;
  length: number;
  annualSalary: number;
  borrow: number;
  bank: boolean;
  messages: string;
}

export class Mortgages {
  offerNumber: string;
  interestRate: number;
  mortgageLength: number;
  amountBorrowed: number;
  amountRepayable: number;
  monthlyRepayments: number;

  constructor() {
    this.offerNumber = '',
      this.interestRate = 0,
      this.mortgageLength = 0,
      this.amountBorrowed = 0,
      this.amountRepayable = 0,
      this.monthlyRepayments = 0
  }
}

export class NumberPipeComponent {
  pi: number = 3.14;
  e: number = 2.718281828459045;
}
