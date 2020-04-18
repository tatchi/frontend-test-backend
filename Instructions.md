## General

Code for both the Node server and the React application are in this repo. See below for more details.

## Server (Node)

Code is located within the `mock-backend.js` file. I slightly modified it:

- Changed the default port to 3001 to not conflict with the default port of CRA
- Removed authentication check from the `/bandwidth` and `/audience` endpoints. Authentication was not in the scope of this test
- Added express `cors` middleware to enable cors

## Frontend (React app)

Code is located under the `frontend` folder. This is an application bootstrapped with `create-react-app`. Code is written with `TypeScript`.

Main file is `App.tsx`, from there you can follow the code. I used two extra libraries:

- [recharts](https://github.com/recharts/recharts) to create the graph
- [react-day-picker](https://github.com/gpbl/react-day-picker) for the date input

I didn't want to spend too much time on this or overengineer things. So I tried to keep things simple.
Below are some points that might be improved:

- Error management: I did not implement any error handling (http, wrong date input, ...)
- Concurrent viewers graph: it's not implemented. Should not be too difficult since I guess it would be quite similar (even simpler) than the current one
- Tests: I did not implement any tests. I would probably have used `cypress` or `react-testing-library`.
- Timeline: I didn't figure out how to position the timeline between the two date input fields.

## Run the application

```bash
# Run server (Node)
yarn start:server

#Run client (React app)
yarn start:client
```

## Contact

Email: corentin.leruth@gmail.com

Don't hesitate to reach out if you have any questions or if you want to discuss anything.
