/**
 * Node test runner for headless execution of DataTests
 */
const fs = require('fs');
const path = require('path');

// Mock browser window and localStorage
const storageStore = {};
global.localStorage = {
  getItem: (key) => storageStore[key] !== undefined ? storageStore[key] : null,
  setItem: (key, val) => { storageStore[key] = String(val); },
  removeItem: (key) => { delete storageStore[key]; },
  clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
};
global.document = {
  getElementById: () => null,
  addEventListener: () => {}
};
global.window = global;

// Load files
eval(fs.readFileSync(path.join(__dirname, '../assets/js/data/storage-service.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../assets/js/data/criteria-schema.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../assets/js/data/smartphone-schema.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../assets/js/saw/saw-engine.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../assets/js/modules/catalog.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../assets/js/modules/compare.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../assets/js/modules/admin-smartphones.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../assets/js/modules/admin-criteria.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../assets/js/modules/admin-reports.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'data-tests.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'catalog-tests.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'saw-tests.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'compare-tests.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'admin-tests.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'report-tests.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'integration-tests.js'), 'utf8'));

// Run all test suites
async function runAllSuites() {
  const dataResults = await DataTests.runAll();
  const catalogResults = await CatalogTests.runAll();
  const sawResults = await SawTests.runAll();
  const compareResults = await CompareTests.runAll();
  const adminResults = await AdminTests.runAll();
  const reportResults = await ReportTests.runAll();
  const integrationResults = await IntegrationTests.runAll();
  const allResults = [
    ...dataResults, 
    ...catalogResults, 
    ...sawResults, 
    ...compareResults, 
    ...adminResults, 
    ...reportResults,
    ...integrationResults
  ];
  const failed = allResults.filter(r => !r.passed);

  console.log(`\n======================================================`);
  console.log(`Hasil Pengujian Keseluruhan: ${allResults.length - failed.length}/${allResults.length} Lulus`);
  console.log(`======================================================`);
  if (failed.length > 0) {
    console.error(`Terdapat kegagalan pada:`, failed);
    process.exit(1);
  } else {
    console.log(`Seluruh pengujian unit, integrasi & regresi (Phase B s/d H) 100% SUKSES!`);
    process.exit(0);
  }
}

runAllSuites();
