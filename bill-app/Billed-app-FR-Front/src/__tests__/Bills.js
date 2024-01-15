/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import BillsUI from '../views/BillsUI.js';

import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { bills } from '../fixtures/bills';
import mockStore from '../__mocks__/store';
import router from '../app/Router.js';
import Bills from '../containers/Bills.js';

jest.mock('../app/store', () => mockStore);

//Avant chaque test on initialise localStorage et le user connecté
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  window.localStorage.setItem(
    'user',
    JSON.stringify({
      type: 'Employee',
      email: 'employee@test.tld',
      status: 'connected',
    }),
  );
});

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      // to-do write expect expression
      //On verifie si l'objet windowIcon a bien la classe active-icon
      expect(windowIcon.classList.contains('active-icon')).toBe(true);
    });
    test('Then bills should be ordered from earliest to latest', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
  describe('When I went on Bills page and it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      // const Nbill = new Bills({
      //   document, onNavigate, store: null, localStorage: window.localStorage
      // })
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getByText('Loading...')).toBeVisible();
      document.body.innerHTML = '';
    });
  });
  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: 'error message' });
      expect(screen.getByText('Erreur')).toBeVisible();
      document.body.innerHTML = '';
    });
  });
  describe('When I am on Bills Page, I click on the button New Bill', () => {
    test('Then, should render the Add a New Bill Page', async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const Nbill = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage,
      });

      document.body.innerHTML = BillsUI({ data: { bills } });
      const handleClickNewBill1 = jest.fn((e) => Nbill.handleClickNewBill());
      await waitFor(() => screen.getByTestId('btn-new-bill'));
      const btnNewBill = screen.getByTestId('btn-new-bill');

      expect(btnNewBill.classList.contains('btn-primary')).toBe(true);
      //On simule le click sur le bouton nouvelle note de frais
      btnNewBill.addEventListener('click', handleClickNewBill1);

      userEvent.click(btnNewBill);
      //Verifier que la fonction handleClickNewBill() a bien été appellé
      expect(handleClickNewBill1).toHaveBeenCalled();

      await waitFor(() => screen.getAllByText('Envoyer une note de frais'));
      //Verifier l'affichage du texte "Envoyer une note de frais" dans la nouvelle page affichée
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
    });
  });
  describe('When I am on Bills Page, I click on the eye icon of Bill', () => {
    test('Then, should render the Modal Justificatif', async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const Nbill = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage,
      });
      $.fn.modal = jest.fn();
      document.body.innerHTML = BillsUI({ data: bills });
      //Récupérer les elements du DOM avec l'attribut data-testid ="icon-eye"
      const elements = screen.getAllByTestId('icon-eye');
      // Itérer à travers les éléments pour trouver celui avec l'attribut data-bill-url spécifique
      let foundElement;
      elements.forEach((element) => {
        const billUrl = element.getAttribute('data-bill-url');
        if (billUrl === 'https://test.storage.tld/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b') {
          foundElement = element;
        }
      });
      // Vérifier si l'élément a été trouvé
      expect(foundElement).toBeDefined();

      const handleClickIconEye1 = jest.fn((e) => Nbill.handleClickIconEye(foundElement));
      //On simule le click sur l'élément trouver precedement
      foundElement.addEventListener('click', handleClickIconEye1);
      userEvent.click(foundElement);
      //Verifier que la fonction handleClickIconEye a bien été appelé
      expect(handleClickIconEye1).toHaveBeenCalled();
      //Récupération de l'objet avec l'attribut alt "Bill"
      const img = screen.getByAltText('Bill');
      //Verifier que l'objet est bien dans le DOM
      expect(img).toBeInTheDocument();
      //Verifier que le chemin de l'objet corespond
      expect(img).toHaveAttribute('src', 'https://test.storage.tld/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b');
    });
  });
});

// test d'intégration GET
describe('Given I am connected as an employee', () => {
  describe('When I navigate to Bills Page', () => {
    test('fetches bills from mock API GET', async () => {
      localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      const dataMocked = jest.spyOn(mockStore.bills(), 'list');
      mockStore.bills().list();

      await waitFor(() => {
        //Verifier que la methode a été appelé une fois
        expect(dataMocked).toHaveBeenCalledTimes(1);
        //Verifier que le nombre d'éléments <tr> du tableau est égal à 4
        expect(document.querySelectorAll('tbody tr').length).toBe(4);
        //Vérifier que le texte "Mes notes de frais" est présent dans le DOM
        expect(screen.findByText('Mes notes de frais')).toBeTruthy();
      });
    });
  });
  describe('When an error occurs on API', () => {
    beforeEach(() => {
      jest.spyOn(mockStore, 'bills');
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock },
      );
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a',
      }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.appendChild(root);
      router();
    });
    test('fetches bills from an API and fails with 404 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => ({
        list: () => Promise.reject(new Error('Erreur 404')),
      }));
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test('fetches messages from an API and fails with 500 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => ({
        list: () => Promise.reject(new Error('Erreur 500')),
      }));

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
