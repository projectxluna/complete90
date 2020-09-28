### Dependencies
- git
- mongo 3.2.22
- node.js v8.15.0 (install from nvm)
- angular-cli
- home brew (https://brew.sh/)
- redis

### Backend Stack
- Node JS express server managed with pm2 (process manager)
- MongoDB database running on the same hardware as web server (probably move to a managed system eventually)
- 

### Setup
1. Clone repository:
`git clone git@github.com:projectxluna/complete90.git`
2. Install node packages
`npm install`
3. Building front-end with angular cli
- For development run the following: (--watch means any code changes to html, css, or ts will trigger a compilation)
`ng build --watch`
- For production run the following:
`ng build --prod`
4. Start web server in development mode
`npm start`

