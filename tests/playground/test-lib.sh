# Prepare folder for lib tests
rm -Rf tests/playground/test-lib && cp -R tests/playground/prisma-examples/javascript/script tests/playground/test-lib
cd tests/playground/test-lib
npm i
npm i --save-dev dotenv
npx prisma-multi-tenant init --provider=sqlite --url=file:management.db
npm link prisma-multi-tenant
npx prisma-multi-tenant new --name=test1 --provider=sqlite --url=file:dev1.db
cp -R ../../lib/ tests/
cp -R ../../../jest.config.js .
jest tests/