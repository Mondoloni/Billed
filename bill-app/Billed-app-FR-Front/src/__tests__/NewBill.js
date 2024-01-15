/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable linebreak-style */
/* eslint-disable import/no-duplicates */
/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import NewBillUI from '../views/NewBillUI.js';

import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { bills } from '../fixtures/bills';
import store from '../__mocks__/store.js';
import mockStore from '../__mocks__/store';
import router from '../app/Router.js';
import NewBill from '../containers/NewBill.js';

jest.mock('../app/store', () => mockStore);

//Avant chaque test on initialise localStorage et le user connecté
//On utilise la route NewBill
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  window.localStorage.setItem(
    'user',
    JSON.stringify({
      type: 'Employee',
      email: 'employee@test.tld',
      status: 'connected',
    }),
  );
  const root = document.createElement('div');
  root.setAttribute('id', 'root');
  document.body.append(root);
  router();
  window.onNavigate(ROUTES_PATH.NewBill);
});
//Apres chaque test on réinitialise les mocks et le contenu du body
afterEach(() => {
  jest.resetAllMocks();
  document.body.innerHTML = '';
});

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then new bill icon in vertical layout should be highlighted', async () => {
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');
      //Verifier que l'objet avec le data-testid: icon-mail a bien la classe active-icon
      expect(mailIcon.classList.contains('active-icon')).toBe(true);

      await waitFor(() => screen.getAllByText('Envoyer une note de frais'));
      //Verifier que le texte "Envoyer une note de frais" est présent dans le DOM
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
    });
  });
  describe('When I am on newBill Page and I fill out the form', () => {
    test("Then I choose an option in the select menu and it should select 'IT et électronique' from select menu", async () => {
      const inputSelect = screen.getByTestId('expense-type');
      //Simule la selection de l'option "IT et électronique" dans la liste
      //deroulant ayant l'attribut data-testid : expense-type
      userEvent.selectOptions(inputSelect, ['IT et électronique']);
      await expect(inputSelect.value).toBe('IT et électronique');
    });
    test('Then I select a date and it should validity', async () => {
      const inputDate = screen.getByTestId('datepicker');
      userEvent.type(inputDate, '2024-01-02');
      //Verifier qu'apres avoir selectionner la date elle soit bien presente
      await expect(inputDate.valueMissing).toBeFalsy();
    });
    test("Then I enter an amount and it should display '300' in the amount input", async () => {
      const inputAmount = screen.getByTestId('amount');
      userEvent.type(inputAmount, '300');
      //Verifier que la valeur 300 est bien presente dans le champ ayant l'attribut
      //data-testid : amount
      await expect(inputAmount.value).toBe('300');
    });
    test("Then I enter a VAT amount and it should display '20' in the VAT amount input", async () => {
      const inputVATAmount = screen.getByTestId('vat');
      userEvent.type(inputVATAmount, '20');
      //Verifier que la valeur 20 est bien presente dans le champ ayant l'attribut
      //data-testid : vat
      await expect(inputVATAmount.value).toBe('20');
    });
    test("Then I enter a VAT Pourcentage and it should display '60' in the VAT Pourcentage input", async () => {
      const inputVATPourcentage = screen.getByTestId('pct');
      userEvent.type(inputVATPourcentage, '60');
      //Verifier que la valeur 60 est bien presente dans le champ ayant l'attribut
      //data-testid : pct
      await expect(inputVATPourcentage.value).toBe('60');
    });
    test("Then I write a commentary and it should display 'Notes de frais pour l'achat d'un MAC BOOK", async () => {
      const inputCommentary = screen.getByTestId('commentary');
      userEvent.type(inputCommentary, "Notes de frais pour l'achat d'un MAC BOOK");
      //Verifier que la valeur "Notes de frais pour l'achat d'un MAC BOOK" 
      //est bien presente dans le champ ayant l'attribut data-testid : commentary
      await expect(inputCommentary.value).toBe("Notes de frais pour l'achat d'un MAC BOOK");
    });
  });

  describe('When I am on newBill Page and I upload a file with an correct extension', () => {
    test('Then no error message for the file input should be displayed', async () => {
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage,
      });
      const handleChangeFile1 = jest.fn(() => newBill.handleChangeFile);

      await waitFor(() => screen.getByTestId('file'));
      const btnSendNewBill = screen.getByTestId('file');
      //Verifier que l'élément avec le data-testid "file" est bien present 
      expect(btnSendNewBill).toBeTruthy();
      //Simuler un evement change sur le bouton avec un objet File
      btnSendNewBill.addEventListener('change', handleChangeFile1);
      fireEvent.change(btnSendNewBill, {
        target: {
          files: [new File(['fileTestPng'], 'test.png', { type: 'image/png' })],
        },
      });
      //Verifier que la fonction handleChangeFile() a été appelé une fois
      expect(handleChangeFile1).toHaveBeenCalledTimes(1);
      //Verifier que le message d'erreur n'apprait pas
      await expect(btnSendNewBill.validationMessage).not.toBe('Formats acceptés : jpg, jpeg et png');
    });
  });
  describe('When I am on newBill Page and I upload a file with an uncorrect extension', () => {
    test('Then error message for the file input should be displayed', async () => {
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage,
      });
      const handleChangeFile1 = jest.fn(() => newBill.handleChangeFile);

      await waitFor(() => screen.getByTestId('file'));
      const btnSendNewBill = screen.getByTestId('file');
      //Verifier que l'élément avec le data-testid "file" est bien present 
      expect(btnSendNewBill).toBeTruthy();
      //Simuler un evement change sur le bouton avec un objet File
      btnSendNewBill.addEventListener('change', handleChangeFile1);
      fireEvent.change(btnSendNewBill, {
        target: {
          // files: [new File(["fileTestPng"], "test.png", { type: "image/png" })],
          files: [new File(['file.pdf'], 'file.pdf', { type: 'file/pdf' })],
        },
      });
//Verifier que la fonction handleChangeFile() a été appelé une fois
      expect(handleChangeFile1).toHaveBeenCalledTimes(1);
      //Verifier que le message d'erreur apprait 
      await expect(btnSendNewBill.validationMessage).toBe('Formats acceptés : jpg, jpeg et png');
    });
  });
  describe('When I am on newBill Page and I submit a valid bill', () => {
    test('Then it should render the Bill Page', async () => {
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage,
      });
      const billSend = {
        name: 'Note de frais',
        date: '2024-01-04',
        type: 'IT et électronique',
        amount: 300,
        pct: 20,
        vat: '60',
        fileName: 'imageNoteDeFrais.jpg',
        fileUrl: 'https://imageNoteDeFrais.jpg',
      };
      const handleSubmit1 = jest.fn((e) => newBill.handleSubmit(e));
      //Ajout des valeurs dans les champs du formulaire
      document.querySelector('input[data-testid="expense-name"]').value = billSend.name;
      document.querySelector('input[data-testid="datepicker"]').value = billSend.date;
      document.querySelector('select[data-testid="expense-type"]').value = billSend.type;
      document.querySelector('input[data-testid="amount"]').value = billSend.amount;
      document.querySelector('input[data-testid="vat"]').value = billSend.vat;
      document.querySelector('input[data-testid="pct"]').value = billSend.pct;
      document.querySelector('textarea[data-testid="commentary"]').value = billSend.commentary;
      newBill.fileUrl = billSend.fileUrl;
      newBill.fileName = billSend.fileName;

      await waitFor(() => screen.getByTestId('form-new-bill'));
      const btnSubmit = screen.getByTestId('form-new-bill');
      //Verifier si l'élément ayant l'attribut data-testid :form-new-bill 
      //est bien present dans le DOM 
      expect(btnSubmit).toBeTruthy();
      //Simuler le click sur l'élément btnSubmit
      btnSubmit.addEventListener('click', handleSubmit1);
      userEvent.click(btnSubmit);
      //Verifier que la fonction handleSubmit a bien été appelé une fois
      expect(handleSubmit1).toHaveBeenCalledTimes(1);
      //Verifier que le texte "Mes notes de frais" est bien présent dans le DOM
      await expect(screen.findByText('Mes notes de frais')).toBeTruthy();
      const windowIcon = screen.getByTestId('icon-window');
      //Verifier que l'objet avec le data-testid: icon-window a bien la classe active-icon
      await expect(windowIcon.classList.contains('active-icon')).toBe(true);
    });
  });
});

// test d'intégration POST new bill
describe('When I am on newBill Page and I submit a valid bill', () => {
  test('Then it should render the Bill Page', async () => {
    const postSpy = jest.spyOn(mockStore, 'bills');
    const billSend = {
      id: '47qAXb6fIm2zOKkLzMro',
      vat: '80',
      fileUrl: 'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
      status: 'pending',
      type: 'Hôtel et logement',
      commentary: 'séminaire billed',
      name: 'encore',
      fileName: 'preview-facture-free-201801-pdf-1.jpg',
      date: '2004-04-04',
      amount: 400,
      commentAdmin: 'ok',
      email: 'a@a',
      pct: 20,
    };

    const postNewBills = await mockStore.bills().update(billSend);
    //Verifier que la methode a été appelé une fois
    expect(postSpy).toHaveBeenCalledTimes(1);
    // vérifier que la valeur retournée par la méthode update est strictement égale à l'objet billSend.
    expect(postNewBills).toStrictEqual(billSend);
  });
  test('Then sends new bill to the API and fails with 404 message error', async () => {
    const postSpy = jest.spyOn(mockStore, 'bills');
    const error = new Error('Erreur 404');
    mockStore.bills.mockImplementationOnce(() => ({
      create: () => Promise.reject(new Error('Erreur 404')),
    }));
    await new Promise(process.nextTick);
    await expect(mockStore.bills().create({})).rejects.toEqual(error);
  });
  test('Then sends new bill to the API and fails with 500 message error', async () => {
    const postSpy = jest.spyOn(mockStore, 'bills');
    const error = new Error('Erreur 500');
    mockStore.bills.mockImplementationOnce(() => ({
      create: () => Promise.reject(new Error('Erreur 500')),
    }));
    await new Promise(process.nextTick);
    await expect(mockStore.bills().create({})).rejects.toEqual(error);
  });
});
