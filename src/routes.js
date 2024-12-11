import Main from './pages/Main/Main';
import Test from './pages/Test/Test';
const routes = [
  {
    path: '/',
    element: <Main />,
  },
  {
    path: '/test',
    element: <Test />
  }
];

export default routes;