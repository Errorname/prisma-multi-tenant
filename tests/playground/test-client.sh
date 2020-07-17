# Prepare folder for client tests
rm -Rf tests/playground/test-client && cp -R tests/playground/example tests/playground/test-client
cd tests/playground/test-client
npm i
PMT_TEST=true npx prisma-multi-tenant init --provider=sqlite --url=file:management.db
npm link prisma-multi-tenant
npx prisma-multi-tenant new --name=test1 --provider=sqlite --url=file:dev1.db
cp -R ../../client/ tests/
cp -R ../../../jest.config.js .
PMT_TEST=true jest tests/