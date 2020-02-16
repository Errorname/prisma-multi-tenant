# Prepare folder for lib tests
rm -Rf tests/playground/test-lib && cp -R tests/playground/prisma-examples/javascript/script tests/playground/test-lib
cd tests/playground/test-lib
npm i
npx prisma-multi-tenant init --provider=sqlite --url=file:management.db
npx prisma-multi-tenant new --name=test1 --url=file:dev1.db
npm link prisma-multi-tenant
cp -R ../../lib/ tests/
cp -R ../../../jest.config.js .
jest tests/