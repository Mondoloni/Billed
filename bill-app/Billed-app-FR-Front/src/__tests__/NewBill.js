/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent,within } from "@testing-library/dom"
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js"

import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { bills } from "../fixtures/bills"
import store from "../__mocks__/store.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import NewBill from "../containers/NewBill.js"

jest.mock("../app/store", () => mockStore)


beforeEach(() => {
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  window.localStorage.setItem(
     "user",
     JSON.stringify({
        type: "Employee",
        email: "employee@test.tld",
        status: "connected",
     })
  );
  const root = document.createElement("div")
  root.setAttribute("id", "root")
  document.body.append(root)
  router()
  window.onNavigate(ROUTES_PATH.NewBill)
});
afterEach(() => {
  jest.resetAllMocks();
  document.body.innerHTML = "";
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then new bill icon in vertical layout should be highlighted", async () => {

      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.classList.contains("active-icon")).toBe(true)

      await waitFor(()=> screen.getAllByText('Envoyer une note de frais'))
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()

    })
  })
  describe("When I am on newBill Page and I fill out the form", () => {
    test("Then I choose an option in the select menu and it should select 'IT et électronique' from select menu", async () => {
      const inputSelect = screen.getByTestId("expense-type");
      userEvent.selectOptions(inputSelect, ["IT et électronique"]);
      await expect(inputSelect.value).toBe("IT et électronique");
    })
    test("Then I select a date and it should validity", async () => {
      const inputDate = screen.getByTestId("datepicker");
      userEvent.type(inputDate, "2024-01-02");
      // console.log(document.body.innerHTML)
      await expect(inputDate.valueMissing).toBeFalsy();
    })
    test("Then I enter an amount and it should display '300' in the amount input", async () => {
      const inputAmount = screen.getByTestId("amount");
      userEvent.type(inputAmount, "300");
      await expect(inputAmount.value).toBe("300");
    })
    test("Then I enter a VAT amount and it should display '20' in the VAT amount input", async () => {
        const inputVATAmount = screen.getByTestId("vat");
        userEvent.type(inputVATAmount, "20");
        await expect(inputVATAmount.value).toBe("20");
    })
    test("Then I enter a VAT Pourcentage and it should display '60' in the VAT Pourcentage input", async () => {
        const inputVATPourcentage = screen.getByTestId("pct");
        userEvent.type(inputVATPourcentage, "60");
        await expect(inputVATPourcentage.value).toBe("60");
    })
    test("Then I write a commentary and it should display 'Notes de frais pour l'achat d'un MAC BOOK", async () => {
        const inputCommentary = screen.getByTestId("commentary");
        userEvent.type(inputCommentary, "Notes de frais pour l'achat d'un MAC BOOK");
        await expect(inputCommentary.value).toBe("Notes de frais pour l'achat d'un MAC BOOK");
    })
  })

  describe("When I am on newBill Page and I upload a file with an correct extension",()=>{
    test("Then no error message for the file input should be displayed", async () => {

      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });
      
      await waitFor(() => screen.getByTestId('file'))
      const btnSendNewBill = screen.getByTestId('file')
      expect(btnSendNewBill).toBeTruthy()
      
      
      const handleChangeFile1 = jest.fn(() => newBill.handleChangeFile)
      // const inputData = bills[0];
      // const file = new File(["img"], inputData.fileName, {
      //   type: ["image/jpg"],
      // })

      btnSendNewBill.addEventListener('change',handleChangeFile1)
      fireEvent.change(btnSendNewBill, {
        target: {
           files: [new File(["fileTestPng"], "test.png", { type: "image/png" })],
        },
     });

      
    //  await userEvent.upload(btnSendNewBill,file)
      expect(handleChangeFile1).toHaveBeenCalledTimes(1)
      await expect(btnSendNewBill.validationMessage).not.toBe("Formats acceptés : jpg, jpeg et png")
      console.log(btnSendNewBill.validationMessage)
      // console.log(inputData.fileName)
    })

  })
  describe("When I am on newBill Page and I upload a file with an uncorrect extension",()=>{
    test("Then error message for the file input should be displayed", async () => {
    //   const onNavigate = (pathname) => {
    //     document.body.innerHTML = ROUTES({ pathname })
    //   }
    //   Object.defineProperty(window, "localStorage", { value: localStorageMock });
    //   window.localStorage.setItem(
    //      "user",
    //      JSON.stringify({
    //         type: "Employee",
    //         email: "employee@test.tld",
    //         status: "connected",
    //      })
    //   );
    //   const root = document.createElement("div")
    //   root.setAttribute("id", "root")
    //   document.body.append(root)
    //   router()
    //   window.onNavigate(ROUTES_PATH.NewBill)

    //   const newBill = new NewBill({ document, onNavigate, store:null, localStorage: window.localStorage });
    //   const handleChangeFile1 = jest.spyOn(newBill, "handleChangeFile")
    //   const inputData = bills[0];
    //   const file = new File(["document"], "document.pdf", {
    //     type: ["application/pdf"],
    //   })

    //   await waitFor(() => screen.getByTestId('file'))
    //   const btnSendNewBill = screen.getByTestId('file')
    //   expect(btnSendNewBill).toBeTruthy()

    //   btnSendNewBill.addEventListener('change',handleChangeFile1)
    //  await userEvent.upload(btnSendNewBill,file)
      // expect(handleChangeFile1).toHaveBeenCalledTimes(1)
      // await expect(btnSendNewBill.validationMessage).toBe("Formats acceptés : jpg, jpeg et png")
      // console.log(document.body.innerHTML)
    })

  })
})
